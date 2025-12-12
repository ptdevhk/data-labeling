/**
 * Example: Semi Design + Tailwind + react-i18next Integration
 *
 * This example shows how to integrate the headless useAnnotator hook
 * with Semi Design UI library, Tailwind CSS, and react-i18next.
 *
 * This is the recommended solution for the user's specific use case.
 */

import React from 'react'
import { useAnnotator } from '@karlorz/react-image-annotate/headless'
import { Button, Layout, List, Select, Space, Typography } from '@douyinfe/semi-ui'
import {
  IconBox,
  IconPolygon,
  IconTarget,
  IconDelete,
  IconSave,
} from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

export function SemiDesignAnnotator({ images, onSave }) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme() // 'light' | 'dark'

  const { state, actions, regions, currentImage, getOutput } = useAnnotator({
    images,
    enabledTools: ['select', 'create-box', 'create-polygon', 'create-point'],
    selectedTool: 'select',
    onExit: onSave,
  })

  const handleSave = () => {
    const output = getOutput()
    onSave(output)
  }

  const tools = [
    { name: 'select', icon: <IconTarget />, label: t('annotator.tools.select') },
    { name: 'create-box', icon: <IconBox />, label: t('annotator.tools.box') },
    { name: 'create-polygon', icon: <IconPolygon />, label: t('annotator.tools.polygon') },
  ]

  return (
    <div className="h-screen" data-theme={resolvedTheme}>
      <Layout className="h-full bg-semi-bg-0">
        {/* Header */}
        <Header className="bg-semi-bg-1 border-b border-semi-border">
          <div className="flex items-center justify-between px-4 py-2">
            <Title heading={5} className="m-0">
              {currentImage?.name || t('annotator.noImage')}
            </Title>
            <Button
              theme="solid"
              type="primary"
              icon={<IconSave />}
              onClick={handleSave}
            >
              {t('annotator.save')}
            </Button>
          </div>
        </Header>

        <Layout className="flex-1">
          {/* Left Sidebar - Tools */}
          <Sider className="w-16 bg-semi-bg-1 border-r border-semi-border">
            <Space vertical spacing="tight" className="p-2 w-full">
              {tools.map(tool => (
                <Button
                  key={tool.name}
                  icon={tool.icon}
                  block
                  type={state.selectedTool === tool.name ? 'primary' : 'tertiary'}
                  onClick={() => actions.selectTool(tool.name)}
                  aria-label={tool.label}
                />
              ))}
            </Space>
          </Sider>

          {/* Main Canvas Area */}
          <Content className="flex items-center justify-center bg-semi-bg-2 p-4">
            <div className="relative w-full h-full max-w-4xl">
              {/* Canvas would go here - you'd need to implement the actual canvas rendering */}
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
                <Text type="secondary">
                  {t('annotator.canvasPlaceholder')}
                </Text>
              </div>
            </div>
          </Content>

          {/* Right Sidebar - Regions */}
          <Sider className="w-80 bg-semi-bg-1 border-l border-semi-border overflow-auto">
            <div className="p-4">
              <Title heading={6} className="mb-4">
                {t('annotator.regions')} ({regions.length})
              </Title>

              <List
                dataSource={regions}
                renderItem={(region, index) => (
                  <List.Item
                    className="hover:bg-semi-bg-2 rounded px-2"
                    main={
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: region.color || '#007bff' }}
                        />
                        <Text>{region.cls || `${t('annotator.region')} ${index + 1}`}</Text>
                      </div>
                    }
                    extra={
                      <Button
                        icon={<IconDelete />}
                        type="tertiary"
                        size="small"
                        onClick={() => actions.deleteRegion(region)}
                      />
                    }
                  />
                )}
                emptyContent={
                  <div className="text-center py-8">
                    <Text type="tertiary">{t('annotator.noRegions')}</Text>
                  </div>
                }
              />
            </div>
          </Sider>
        </Layout>
      </Layout>
    </div>
  )
}

/**
 * i18n Translation Keys Required:
 *
 * Add these to your locales/en.json, locales/vi.json, locales/zh.json:
 *
 * {
 *   "annotator": {
 *     "tools": {
 *       "select": "Select",
 *       "box": "Bounding Box",
 *       "polygon": "Polygon"
 *     },
 *     "save": "Save",
 *     "noImage": "No Image",
 *     "regions": "Regions",
 *     "region": "Region",
 *     "noRegions": "No regions yet. Select a tool to start annotating.",
 *     "canvasPlaceholder": "Canvas rendering would go here"
 *   }
 * }
 */

export default SemiDesignAnnotator
