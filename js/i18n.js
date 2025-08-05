/**
 * 国际化模块
 * 处理多语言切换和SEO优化
 */

class I18nManager {
  constructor() {
    this.currentLang = this.getLanguageFromURL() || 'zh';
    this.translations = {
      zh: {
        title: 'AFX · 支付宝体验技术部 · 引领体验科技，驱动数字生活',
        description: 'AFX · 支付宝体验技术部 - 引领体验科技，驱动数字生活。专注于前端技术、开源产品和企业级应用开发。',
        ogTitle: 'AFX · 支付宝体验技术部',
        ogDescription: '引领体验科技，驱动数字生活'
      },
      en: {
        title: 'AFX · Alipay Experience Technology Department · Leading Experience Technology, Driving Digital Life',
        description: 'AFX · Alipay Experience Technology Department - Leading Experience Technology, Driving Digital Life. Focused on frontend technology, open source products and enterprise application development.',
        ogTitle: 'AFX · Alipay Experience Technology Department',
        ogDescription: 'Leading Experience Technology, Driving Digital Life'
      }
    };
    
    this.init();
  }

  /**
   * 从URL获取语言参数
   */
  getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang');
  }

  /**
   * 更新URL参数
   */
  updateURL(lang) {
    const url = new URL(window.location);
    if (lang === 'zh') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url);
  }

  /**
   * 更新页面标题和meta标签
   */
  updateMetaTags(lang) {
    const translation = this.translations[lang];
    
    // 更新页面标题
    document.title = translation.title;
    
    // 更新meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', translation.description);
    }
    
    // 更新Open Graph标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', translation.ogTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', translation.ogDescription);
    }
  }

  /**
   * 更新DOM元素内容
   */
  updateDOMContent(lang) {
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
      const text = lang === 'zh' ? element.getAttribute('data-zh') : element.getAttribute('data-en');
      element.textContent = text;
    });
  }

  /**
   * 更新语言切换按钮
   */
  updateLanguageToggle(lang) {
    const link = document.getElementById('lang-toggle');
    if (link) {
      link.textContent = lang === 'zh' ? 'EN' : '中文';
      link.setAttribute('aria-label', lang === 'zh' ? '切换语言' : 'Switch Language');
    }
  }

  /**
   * 切换语言
   */
  switchLanguage(lang) {
    this.currentLang = lang;
    
    // 更新DOM内容
    this.updateDOMContent(lang);
    
    // 更新meta标签
    this.updateMetaTags(lang);
    
    // 更新语言切换按钮
    this.updateLanguageToggle(lang);
    
    // 更新URL
    this.updateURL(lang);
    
    // 分发语言切换事件
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { lang: lang }
    }));
  }

  /**
   * 初始化
   */
  init() {
    // 页面加载时初始化语言
    document.addEventListener('DOMContentLoaded', () => {
      if (this.currentLang === 'en') {
        this.switchLanguage('en');
      }
    });

    // 绑定语言切换事件
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = this.currentLang === 'zh' ? 'en' : 'zh';
        this.switchLanguage(newLang);
      });
    }
  }
}

// 初始化国际化管理器
const i18n = new I18nManager(); 