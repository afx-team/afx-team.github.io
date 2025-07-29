/**
 * AFX Team 网站主脚本
 * 处理页面交互和功能
 */

class WebsiteManager {
  constructor() {
    this.init();
  }

  /**
   * 初始化网站功能
   */
  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupInteractiveElements();
    this.setupAccessibility();
  }

  /**
   * 设置移动端菜单
   */
  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        this.updateMenuButton(mobileMenuBtn, mobileMenu.classList.contains('hidden'));
      });
    }
  }

  /**
   * 更新菜单按钮状态
   */
  updateMenuButton(button, isHidden) {
    const icon = button.querySelector('.menu-icon');
    if (icon) {
      icon.textContent = isHidden ? '☰' : '✕';
    }
    button.setAttribute('aria-expanded', !isHidden);
  }

  /**
   * 设置平滑滚动
   */
  setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          this.scrollToElement(targetElement);
        }
      });
    });
  }

  /**
   * 滚动到指定元素
   */
  scrollToElement(element) {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const elementPosition = element.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }

  /**
   * 设置交互元素
   */
  setupInteractiveElements() {
    this.setupCards();
    this.setupTags();
    this.setupLinks();
  }

  /**
   * 设置卡片交互
   */
  setupCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        this.handleCardClick(card);
      });
      
      // 键盘导航支持
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(card);
        }
      });
    });
  }

  /**
   * 处理卡片点击
   */
  handleCardClick(card) {
    // 添加点击反馈
    card.style.borderColor = 'var(--color-text-lighter)';
    
    // 重置样式
    setTimeout(() => {
      card.style.borderColor = '';
    }, 200);
  }

  /**
   * 设置标签交互
   */
  setupTags() {
    const tags = document.querySelectorAll('.tag');
    
    tags.forEach((tag) => {
      tag.addEventListener('click', () => {
        this.handleTagClick(tag);
      });
    });
  }

  /**
   * 处理标签点击
   */
  handleTagClick(tag) {
    tag.style.backgroundColor = 'var(--color-border)';
    
    setTimeout(() => {
      tag.style.backgroundColor = '';
    }, 200);
  }

  /**
   * 设置链接交互
   */
  setupLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        this.handleExternalLinkClick(e, link);
      });
    });
  }

  /**
   * 处理外部链接点击
   */
  handleExternalLinkClick(e, link) {
    // 可以在这里添加分析代码
    console.log('External link clicked:', link.href);
  }

  /**
   * 设置无障碍功能
   */
  setupAccessibility() {
    this.setupSkipLinks();
    this.setupFocusManagement();
    this.setupKeyboardNavigation();
  }

  /**
   * 设置跳过链接
   */
  setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.focus();
          this.scrollToElement(targetElement);
        }
      });
    });
  }

  /**
   * 设置焦点管理
   */
  setupFocusManagement() {
    // 监听焦点变化
    document.addEventListener('focusin', (e) => {
      this.handleFocusIn(e);
    });
    
    document.addEventListener('focusout', (e) => {
      this.handleFocusOut(e);
    });
  }

  /**
   * 处理焦点进入
   */
  handleFocusIn(e) {
    const target = e.target;
    
    // 为焦点元素添加视觉反馈
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      target.classList.add('focus-visible');
    }
  }

  /**
   * 处理焦点离开
   */
  handleFocusOut(e) {
    const target = e.target;
    
    // 移除焦点元素的视觉反馈
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      target.classList.remove('focus-visible');
    }
  }

  /**
   * 设置键盘导航
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  /**
   * 处理键盘导航
   */
  handleKeyboardNavigation(e) {
    // ESC键关闭菜单
    if (e.key === 'Escape') {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
          this.updateMenuButton(mobileMenuBtn, true);
        }
      }
    }
  }

  /**
   * 工具方法：防抖
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 工具方法：节流
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new WebsiteManager();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebsiteManager;
}
