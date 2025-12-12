import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  Typography,
  Banner,
  Tabs,
  TabPane,
  Card,
  Input,
  InputNumber,
  Switch,
  TextArea,
  Row,
  Col,
  Divider,
  Tooltip,
} from '@douyinfe/semi-ui';
import { IconPlus, IconDelete, IconAlertTriangle } from '@douyinfe/semi-icons';

const { Text } = Typography;

// Unique ID generator, ensures stable and incremental IDs within component lifecycle
const generateUniqueId = (() => {
  let counter = 0;
  return () => `kv_${counter++}`;
})();

const JSONEditor = ({
  value = '',
  onChange,
  field,
  label,
  placeholder,
  extraText,
  extraFooter,
  showClear = true,
  template,
  templateLabel,
  editorType = 'keyValue',
  rules = [],
  formApi = null,
  ...props
}) => {
  const { t } = useTranslation();

  // Convert object to key-value array (with unique IDs)
  const objectToKeyValueArray = useCallback((obj, prevPairs = []) => {
    if (!obj || typeof obj !== 'object') return [];

    const entries = Object.entries(obj);
    return entries.map(([key, value], index) => {
      // If the key at the same position matches the previous conversion, reuse its id to keep React key stable
      const prev = prevPairs[index];
      const shouldReuseId = prev && prev.key === key;
      return {
        id: shouldReuseId ? prev.id : generateUniqueId(),
        key,
        value,
      };
    });
  }, []);

  // Convert key-value array to object (duplicate keys: later values overwrite earlier ones)
  const keyValueArrayToObject = useCallback((arr) => {
    const result = {};
    arr.forEach((item) => {
      if (item.key) {
        result[item.key] = item.value;
      }
    });
    return result;
  }, []);

  // Initialize key-value array
  const [keyValuePairs, setKeyValuePairs] = useState(() => {
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return objectToKeyValueArray(parsed);
      } catch {
        return [];
      }
    }
    if (typeof value === 'object' && value !== null) {
      return objectToKeyValueArray(value);
    }
    return [];
  });

  // Local text buffer for manual mode
  const [manualText, setManualText] = useState(() => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object')
      return JSON.stringify(value, null, 2);
    return '';
  });

  // Determine default edit mode based on number of keys
  const [editMode, setEditMode] = useState(() => {
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const keyCount = Object.keys(parsed).length;
        return keyCount > 10 ? 'manual' : 'visual';
      } catch {
        return 'manual';
      }
    }
    return 'visual';
  });

  const [jsonError, setJsonError] = useState('');

  // Calculate duplicate keys
  const duplicateKeys = useMemo(() => {
    const keyCount = {};
    const duplicates = new Set();

    keyValuePairs.forEach((pair) => {
      if (pair.key) {
        keyCount[pair.key] = (keyCount[pair.key] || 0) + 1;
        if (keyCount[pair.key] > 1) {
          duplicates.add(pair.key);
        }
      }
    });

    return duplicates;
  }, [keyValuePairs]);

  // Data sync - update key-value array when value changes
  useEffect(() => {
    try {
      let parsed = {};
      if (typeof value === 'string' && value.trim()) {
        parsed = JSON.parse(value);
      } else if (typeof value === 'object' && value !== null) {
        parsed = value;
      }

      // Only update when external value actually changes, avoid circular updates
      const currentObj = keyValueArrayToObject(keyValuePairs);
      if (JSON.stringify(parsed) !== JSON.stringify(currentObj)) {
        const newPairs = objectToKeyValueArray(parsed, keyValuePairs);
        setKeyValuePairs(newPairs);
      }
      setJsonError('');
    } catch (error) {
      console.log('JSON parse failed:', error.message);
      setJsonError(error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // When external value changes, sync manual text if not in manual mode
  useEffect(() => {
    if (editMode !== 'manual') {
      if (typeof value === 'string') setManualText(value);
      else if (value && typeof value === 'object')
        setManualText(JSON.stringify(value, null, 2));
      else setManualText('');
    }
  }, [value, editMode]);

  // Handle visual editing data changes
  const handleVisualChange = useCallback(
    (newPairs) => {
      setKeyValuePairs(newPairs);
      const jsonObject = keyValueArrayToObject(newPairs);
      const jsonString =
        Object.keys(jsonObject).length === 0
          ? ''
          : JSON.stringify(jsonObject, null, 2);

      setJsonError('');

      // Set value via formApi
      if (formApi && field) {
        formApi.setValue(field, jsonString);
      }

      onChange?.(jsonString);
    },
    [onChange, formApi, field, keyValueArrayToObject],
  );

  // Handle manual editing data changes
  const handleManualChange = useCallback(
    (newValue) => {
      setManualText(newValue);
      if (newValue && newValue.trim()) {
        try {
          const parsed = JSON.parse(newValue);
          setKeyValuePairs(objectToKeyValueArray(parsed, keyValuePairs));
          setJsonError('');
          onChange?.(newValue);
        } catch (error) {
          setJsonError(error.message);
        }
      } else {
        setKeyValuePairs([]);
        setJsonError('');
        onChange?.('');
      }
    },
    [onChange, objectToKeyValueArray, keyValuePairs],
  );

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (editMode === 'visual') {
      const jsonObject = keyValueArrayToObject(keyValuePairs);
      setManualText(
        Object.keys(jsonObject).length === 0
          ? ''
          : JSON.stringify(jsonObject, null, 2),
      );
      setEditMode('manual');
    } else {
      try {
        let parsed = {};
        if (manualText && manualText.trim()) {
          parsed = JSON.parse(manualText);
        } else if (typeof value === 'string' && value.trim()) {
          parsed = JSON.parse(value);
        } else if (typeof value === 'object' && value !== null) {
          parsed = value;
        }
        setKeyValuePairs(objectToKeyValueArray(parsed, keyValuePairs));
        setJsonError('');
        setEditMode('visual');
      } catch (error) {
        setJsonError(error.message);
        return;
      }
    }
  }, [
    editMode,
    value,
    manualText,
    keyValuePairs,
    keyValueArrayToObject,
    objectToKeyValueArray,
  ]);

  // Add key-value pair
  const addKeyValue = useCallback(() => {
    const newPairs = [...keyValuePairs];
    const existingKeys = newPairs.map((p) => p.key);
    let counter = 1;
    let newKey = `field_${counter}`;
    while (existingKeys.includes(newKey)) {
      counter += 1;
      newKey = `field_${counter}`;
    }
    newPairs.push({
      id: generateUniqueId(),
      key: newKey,
      value: '',
    });
    handleVisualChange(newPairs);
  }, [keyValuePairs, handleVisualChange]);

  // Delete key-value pair
  const removeKeyValue = useCallback(
    (id) => {
      const newPairs = keyValuePairs.filter((pair) => pair.id !== id);
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // Update key name
  const updateKey = useCallback(
    (id, newKey) => {
      const newPairs = keyValuePairs.map((pair) =>
        pair.id === id ? { ...pair, key: newKey } : pair,
      );
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // Update value
  const updateValue = useCallback(
    (id, newValue) => {
      const newPairs = keyValuePairs.map((pair) =>
        pair.id === id ? { ...pair, value: newValue } : pair,
      );
      handleVisualChange(newPairs);
    },
    [keyValuePairs, handleVisualChange],
  );

  // Fill template
  const fillTemplate = useCallback(() => {
    if (template) {
      const templateString = JSON.stringify(template, null, 2);

      if (formApi && field) {
        formApi.setValue(field, templateString);
      }

      setManualText(templateString);
      setKeyValuePairs(objectToKeyValueArray(template, keyValuePairs));
      onChange?.(templateString);
      setJsonError('');
    }
  }, [
    template,
    onChange,
    formApi,
    field,
    objectToKeyValueArray,
    keyValuePairs,
  ]);

  // Render value input control (supports nesting)
  const renderValueInput = (pairId, value) => {
    const valueType = typeof value;

    if (valueType === 'boolean') {
      return (
        <div className='flex items-center'>
          <Switch
            checked={value}
            onChange={(newValue) => updateValue(pairId, newValue)}
          />
          <Text type='tertiary' className='ml-2'>
            {value ? t('true') : t('false')}
          </Text>
        </div>
      );
    }

    if (valueType === 'number') {
      return (
        <InputNumber
          value={value}
          onChange={(newValue) => updateValue(pairId, newValue)}
          style={{ width: '100%' }}
          placeholder={t('enterNumber')}
        />
      );
    }

    if (valueType === 'object' && value !== null) {
      // Simplify nested object handling, use TextArea
      return (
        <TextArea
          rows={2}
          value={JSON.stringify(value, null, 2)}
          onChange={(txt) => {
            try {
              const obj = txt.trim() ? JSON.parse(txt) : {};
              updateValue(pairId, obj);
            } catch {
              // Ignore parse error
            }
          }}
          placeholder={t('enterJSONObject')}
        />
      );
    }

    // String or other primitive types
    return (
      <Input
        placeholder={t('parameterValue')}
        value={String(value)}
        onChange={(newValue) => {
          let convertedValue = newValue;
          if (newValue === 'true') convertedValue = true;
          else if (newValue === 'false') convertedValue = false;
          else if (!isNaN(newValue) && newValue !== '') {
            const num = Number(newValue);
            // Check if it's an integer
            if (Number.isInteger(num)) {
              convertedValue = num;
            }
          }
          updateValue(pairId, convertedValue);
        }}
      />
    );
  };

  // Render key-value editor
  const renderKeyValueEditor = () => {
    return (
      <div className='space-y-1'>
        {/* Duplicate key warning */}
        {duplicateKeys.size > 0 && (
          <Banner
            type='warning'
            icon={<IconAlertTriangle />}
            description={
              <div>
                <Text strong>{t('duplicateKeysFound')}</Text>
                <Text>{Array.from(duplicateKeys).join(', ')}</Text>
                <br />
                <Text type='tertiary' size='small'>
                  {t('duplicateKeysNote')}
                </Text>
              </div>
            }
            className='mb-3'
          />
        )}

        {keyValuePairs.length === 0 && (
          <div className='text-center py-6 px-4'>
            <Text type='tertiary' className='text-gray-500 text-sm'>
              {t('noDataClickToAdd')}
            </Text>
          </div>
        )}

        {keyValuePairs.map((pair, index) => {
          const isDuplicate = duplicateKeys.has(pair.key);
          const isLastDuplicate =
            isDuplicate &&
            keyValuePairs.slice(index + 1).every((p) => p.key !== pair.key);

          return (
            <Row key={pair.id} gutter={8} align='middle'>
              <Col span={10}>
                <div className='relative'>
                  <Input
                    placeholder={t('keyName')}
                    value={pair.key}
                    onChange={(newKey) => updateKey(pair.id, newKey)}
                    status={isDuplicate ? 'warning' : undefined}
                  />
                  {isDuplicate && (
                    <Tooltip
                      content={
                        isLastDuplicate
                          ? t('lastDuplicateKeyWillBeUsed')
                          : t('duplicateKeyWillBeOverwritten')
                      }
                    >
                      <IconAlertTriangle
                        className='absolute right-2 top-1/2 transform -translate-y-1/2'
                        style={{
                          color: isLastDuplicate ? '#ff7d00' : '#faad14',
                          fontSize: '14px',
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </Col>
              <Col span={12}>{renderValueInput(pair.id, pair.value)}</Col>
              <Col span={2}>
                <Button
                  icon={<IconDelete />}
                  type='danger'
                  theme='borderless'
                  onClick={() => removeKeyValue(pair.id)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          );
        })}

        <div className='mt-2 flex justify-center'>
          <Button
            icon={<IconPlus />}
            type='primary'
            theme='outline'
            onClick={addKeyValue}
          >
            {t('addKeyValuePair')}
          </Button>
        </div>
      </div>
    );
  };

  // Render region editor (special format) - also needs to support duplicate keys
  const renderRegionEditor = () => {
    const defaultPair = keyValuePairs.find((pair) => pair.key === 'default');
    const modelPairs = keyValuePairs.filter((pair) => pair.key !== 'default');

    return (
      <div className='space-y-2'>
        {/* Duplicate key warning */}
        {duplicateKeys.size > 0 && (
          <Banner
            type='warning'
            icon={<IconAlertTriangle />}
            description={
              <div>
                <Text strong>{t('duplicateKeysFound')}</Text>
                <Text>{Array.from(duplicateKeys).join(', ')}</Text>
                <br />
                <Text type='tertiary' size='small'>
                  {t('duplicateKeysNote')}
                </Text>
              </div>
            }
            className='mb-3'
          />
        )}

        {/* Default region */}
        <Form.Slot label={t('defaultRegion')}>
          <Input
            placeholder={t('defaultRegionPlaceholder')}
            value={defaultPair ? defaultPair.value : ''}
            onChange={(value) => {
              if (defaultPair) {
                updateValue(defaultPair.id, value);
              } else {
                const newPairs = [
                  ...keyValuePairs,
                  {
                    id: generateUniqueId(),
                    key: 'default',
                    value: value,
                  },
                ];
                handleVisualChange(newPairs);
              }
            }}
          />
        </Form.Slot>

        {/* Model-specific region */}
        <Form.Slot label={t('modelSpecificRegion')}>
          <div>
            {modelPairs.map((pair) => {
              const isDuplicate = duplicateKeys.has(pair.key);
              return (
                <Row key={pair.id} gutter={8} align='middle' className='mb-2'>
                  <Col span={10}>
                    <div className='relative'>
                      <Input
                        placeholder={t('modelName')}
                        value={pair.key}
                        onChange={(newKey) => updateKey(pair.id, newKey)}
                        status={isDuplicate ? 'warning' : undefined}
                      />
                      {isDuplicate && (
                        <Tooltip content={t('duplicateKeyName')}>
                          <IconAlertTriangle
                            className='absolute right-2 top-1/2 transform -translate-y-1/2'
                            style={{ color: '#faad14', fontSize: '14px' }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Input
                      placeholder={t('region')}
                      value={pair.value}
                      onChange={(newValue) => updateValue(pair.id, newValue)}
                    />
                  </Col>
                  <Col span={2}>
                    <Button
                      icon={<IconDelete />}
                      type='danger'
                      theme='borderless'
                      onClick={() => removeKeyValue(pair.id)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              );
            })}

            <div className='mt-2 flex justify-center'>
              <Button
                icon={<IconPlus />}
                onClick={addKeyValue}
                type='primary'
                theme='outline'
              >
                {t('addModelRegion')}
              </Button>
            </div>
          </div>
        </Form.Slot>
      </div>
    );
  };

  // Render visual editor
  const renderVisualEditor = () => {
    switch (editorType) {
      case 'region':
        return renderRegionEditor();
      case 'object':
      case 'keyValue':
      default:
        return renderKeyValueEditor();
    }
  };

  const hasJsonError = jsonError && jsonError.trim() !== '';

  return (
    <Form.Slot label={label}>
      <Card
        header={
          <div className='flex justify-between items-center'>
            <Tabs
              type='slash'
              activeKey={editMode}
              onChange={(key) => {
                if (key === 'manual' && editMode === 'visual') {
                  setEditMode('manual');
                } else if (key === 'visual' && editMode === 'manual') {
                  toggleEditMode();
                }
              }}
            >
              <TabPane tab={t('visual')} itemKey='visual' />
              <TabPane tab={t('manualEdit')} itemKey='manual' />
            </Tabs>

            {template && templateLabel && (
              <Button type='tertiary' onClick={fillTemplate} size='small'>
                {templateLabel}
              </Button>
            )}
          </div>
        }
        headerStyle={{ padding: '12px 16px' }}
        bodyStyle={{ padding: '16px' }}
        className='!rounded-2xl'
      >
        {/* JSON error message */}
        {hasJsonError && (
          <Banner
            type='danger'
            description={`JSON ${t('formatError')}: ${jsonError}`}
            className='mb-3'
          />
        )}

        {/* Editor content */}
        {editMode === 'visual' ? (
          <div>
            {renderVisualEditor()}
            {/* Hidden Form field for validation and data binding */}
            <Form.Input
              field={field}
              value={value}
              rules={rules}
              style={{ display: 'none' }}
              noLabel={true}
              {...props}
            />
          </div>
        ) : (
          <div>
            <TextArea
              placeholder={placeholder}
              value={manualText}
              onChange={handleManualChange}
              showClear={showClear}
              rows={Math.max(8, manualText ? manualText.split('\n').length : 8)}
            />
            {/* Hidden Form field for validation and data binding */}
            <Form.Input
              field={field}
              value={value}
              rules={rules}
              style={{ display: 'none' }}
              noLabel={true}
              {...props}
            />
          </div>
        )}

        {/* Extra text displayed at card bottom */}
        {extraText && (
          <Divider margin='12px' align='center'>
            <Text type='tertiary' size='small'>
              {extraText}
            </Text>
          </Divider>
        )}
        {extraFooter && <div className='mt-1'>{extraFooter}</div>}
      </Card>
    </Form.Slot>
  );
};

export default JSONEditor;
