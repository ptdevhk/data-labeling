import React, { createContext, useContext, useMemo } from "react"
import PropTypes from "prop-types"

// Default English translations
export const DEFAULT_TRANSLATIONS = {
  // Header buttons
  "header.prev": "Prev",
  "header.next": "Next",
  "header.clone": "Clone",
  "header.settings": "Settings",
  "header.fullscreen": "Fullscreen",
  "header.window": "Window",
  "header.save": "Save",
  "header.play": "Play",
  "header.pause": "Pause",

  // Sidebar sections
  "sidebar.taskDescription": "Task Description",
  "sidebar.classifications": "Classifications",
  "sidebar.regions": "Regions",
  "sidebar.history": "History",
  "sidebar.debug": "Debug",
  "sidebar.images": "Images",
  "sidebar.keyframes": "Keyframes",
  "sidebar.tags": "Image Tags",

  // Tools
  "tools.select": "Select",
  "tools.pan": "Drag/Pan (right or middle click)",
  "tools.zoom": "Zoom In/Out (scroll)",
  "tools.showTags": "Show / Hide Tags",
  "tools.createPoint": "Add Point",
  "tools.createBox": "Add Bounding Box",
  "tools.createPolygon": "Add Polygon",
  "tools.createLine": "Add Line",
  "tools.createExpandingLine": "Add Expanding Line",
  "tools.createKeypoints": "Add Keypoints (Pose)",
  "tools.showMask": "Show / Hide Mask",
  "tools.modifyAllowedArea": "Modify Allowed Area",

  // Settings Dialog
  settings: "Settings",
  show_crosshairs: "Show Crosshairs",
  show_highlight_box: "Show Highlight Box",
  wasd_mode: "WASD Mode",
  video_playback_speed: "Video Playback Speed",
  close: "Close",

  // Common
  "common.noImage": "No Image",
  "common.loading": "Loading...",
}

// Built-in translations
export const BUILT_IN_TRANSLATIONS = {
  en: DEFAULT_TRANSLATIONS,
  zh: {
    "header.prev": "上一张",
    "header.next": "下一张",
    "header.clone": "克隆",
    "header.settings": "设置",
    "header.fullscreen": "全屏",
    "header.window": "窗口",
    "header.save": "保存",
    "header.play": "播放",
    "header.pause": "暂停",

    "sidebar.taskDescription": "任务描述",
    "sidebar.classifications": "分类",
    "sidebar.regions": "区域",
    "sidebar.history": "历史",
    "sidebar.debug": "调试",
    "sidebar.images": "图像",
    "sidebar.keyframes": "关键帧",
    "sidebar.tags": "图像标签",

    "tools.select": "选择",
    "tools.pan": "拖动/平移 (右键或中键)",
    "tools.zoom": "缩放 (滚轮)",
    "tools.showTags": "显示/隐藏标签",
    "tools.createPoint": "添加点",
    "tools.createBox": "添加边界框",
    "tools.createPolygon": "添加多边形",
    "tools.createLine": "添加线",
    "tools.createExpandingLine": "添加扩展线",
    "tools.createKeypoints": "添加关键点 (姿态)",
    "tools.showMask": "显示/隐藏蒙版",
    "tools.modifyAllowedArea": "修改允许区域",

    settings: "设置",
    show_crosshairs: "显示十字线",
    show_highlight_box: "显示高亮框",
    wasd_mode: "WASD模式",
    video_playback_speed: "视频播放速度",
    close: "关闭",

    "common.noImage": "无图像",
    "common.loading": "加载中...",
  },
  vi: {
    "header.prev": "Trước",
    "header.next": "Tiếp theo",
    "header.clone": "Sao chép",
    "header.settings": "Cài đặt",
    "header.fullscreen": "Toàn màn hình",
    "header.window": "Cửa sổ",
    "header.save": "Lưu",
    "header.play": "Phát",
    "header.pause": "Tạm dừng",

    "sidebar.taskDescription": "Mô tả nhiệm vụ",
    "sidebar.classifications": "Phân loại",
    "sidebar.regions": "Vùng",
    "sidebar.history": "Lịch sử",
    "sidebar.debug": "Gỡ lỗi",
    "sidebar.images": "Hình ảnh",
    "sidebar.keyframes": "Khung hình chính",
    "sidebar.tags": "Thẻ hình ảnh",

    "tools.select": "Chọn",
    "tools.pan": "Kéo/Di chuyển (chuột phải hoặc giữa)",
    "tools.zoom": "Phóng to/Thu nhỏ (cuộn)",
    "tools.showTags": "Hiện/Ẩn nhãn",
    "tools.createPoint": "Thêm điểm",
    "tools.createBox": "Thêm hộp giới hạn",
    "tools.createPolygon": "Thêm đa giác",
    "tools.createLine": "Thêm đường",
    "tools.createExpandingLine": "Thêm đường mở rộng",
    "tools.createKeypoints": "Thêm điểm chính (Tư thế)",
    "tools.showMask": "Hiện/Ẩn mặt nạ",
    "tools.modifyAllowedArea": "Sửa vùng cho phép",

    settings: "Cài đặt",
    show_crosshairs: "Hiện dấu chữ thập",
    show_highlight_box: "Hiện hộp nổi bật",
    wasd_mode: "Chế độ WASD",
    video_playback_speed: "Tốc độ phát video",
    close: "Đóng",

    "common.noImage": "Không có hình ảnh",
    "common.loading": "Đang tải...",
  },
}

const I18nContext = createContext({
  t: (key, fallback) => fallback || key, // Return fallback first, then key
  language: "en",
  translations: DEFAULT_TRANSLATIONS,
})

/**
 * I18nProvider - Optional provider for internationalization
 *
 * @example
 * // Basic usage with built-in translations
 * <I18nProvider language="zh">
 *   <Annotator {...props} />
 * </I18nProvider>
 *
 * @example
 * // Custom translations
 * <I18nProvider
 *   language="fr"
 *   translations={{
 *     fr: { 'header.save': 'Enregistrer', ... }
 *   }}
 * >
 *   <Annotator {...props} />
 * </I18nProvider>
 *
 * @example
 * // Integration with react-i18next
 * function MyApp() {
 *   const { i18n } = useTranslation()
 *   return (
 *     <I18nProvider
 *       language={i18n.language}
 *       translations={{
 *         [i18n.language]: {
 *           'header.save': i18n.t('annotator.save'),
 *           // ... map all keys
 *         }
 *       }}
 *     >
 *       <Annotator {...props} />
 *     </I18nProvider>
 *   )
 * }
 */
export function I18nProvider({ children, language = "en", translations }) {
  const value = useMemo(() => {
    // Merge built-in translations with custom ones
    const allTranslations = {
      ...BUILT_IN_TRANSLATIONS,
      ...translations,
    }

    const currentTranslations =
      allTranslations[language] || DEFAULT_TRANSLATIONS

    const t = (key, fallback) => {
      return currentTranslations[key] || fallback || key
    }

    return { t, language, translations: currentTranslations }
  }, [language, translations])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

I18nProvider.propTypes = {
  children: PropTypes.node.isRequired,
  language: PropTypes.string,
  translations: PropTypes.objectOf(PropTypes.object),
}

/**
 * useI18n - Hook to access translations
 * Safe to use even without I18nProvider (returns English defaults)
 */
export function useI18n() {
  return useContext(I18nContext)
}

export default I18nProvider
