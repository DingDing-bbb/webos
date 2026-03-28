/**
 * Browser Kernel - 简化版浏览器内核
 */

// ============================================
// DOM 实现
// ============================================

export const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
} as const;

export interface DOMNode {
  nodeType: number;
  nodeName: string;
  textContent: string | null;
  childNodes: DOMNode[];
  parentNode: DOMNode | null;
}

export class TextNode implements DOMNode {
  nodeType = NodeType.TEXT_NODE;
  nodeName = '#text';
  childNodes: DOMNode[] = [];
  parentNode: DOMNode | null = null;
  
  constructor(private _text: string) {}
  
  get textContent(): string { return this._text; }
  set textContent(v: string) { this._text = v; }
}

export class ElementNode implements DOMNode {
  nodeType = NodeType.ELEMENT_NODE;
  childNodes: DOMNode[] = [];
  parentNode: DOMNode | null = null;
  textContent: string | null = null;
  
  private _attributes: Map<string, string> = new Map();
  private _style: Map<string, string> = new Map();
  
  constructor(public nodeName: string) {}
  
  get tagName(): string { return this.nodeName.toUpperCase(); }
  
  getAttribute(name: string): string | null {
    return this._attributes.get(name) || null;
  }
  
  setAttribute(name: string, value: string): void {
    this._attributes.set(name, value);
    if (name === 'style') {
      this._parseStyle(value);
    }
  }
  
  getStyle(prop: string): string | undefined {
    return this._style.get(prop);
  }
  
  private _parseStyle(styleStr: string): void {
    const parts = styleStr.split(';');
    for (const part of parts) {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) {
        this._style.set(key, value);
      }
    }
  }
  
  appendChild(child: DOMNode): void {
    child.parentNode = this;
    this.childNodes.push(child);
  }
}

export class DocumentNode implements DOMNode {
  nodeType = NodeType.DOCUMENT_NODE;
  nodeName = '#document';
  childNodes: DOMNode[] = [];
  parentNode: DOMNode | null = null;
  textContent: string | null = null;
  
  documentElement: ElementNode | null = null;
  private _title: string = '';
  
  createElement(tagName: string): ElementNode {
    return new ElementNode(tagName.toLowerCase());
  }
  
  createTextNode(text: string): TextNode {
    return new TextNode(text);
  }
  
  appendChild(child: DOMNode): void {
    child.parentNode = this;
    this.childNodes.push(child);
    if (child instanceof ElementNode && child.nodeName === 'html') {
      this.documentElement = child;
    }
  }
  
  setTitle(title: string): void {
    this._title = title;
  }
  
  getTitle(): string {
    return this._title;
  }
}

// ============================================
// HTML 解析器（简化版）
// ============================================

export class HTMLParser {
  parse(html: string): DocumentNode {
    const doc = new DocumentNode();
    
    // 创建基本结构
    const htmlEl = doc.createElement('html');
    doc.appendChild(htmlEl);
    
    const head = doc.createElement('head');
    htmlEl.appendChild(head);
    
    const body = doc.createElement('body');
    htmlEl.appendChild(body);
    
    // 简单解析
    this._parseContent(html, doc, head, body);
    
    return doc;
  }
  
  private _parseContent(html: string, doc: DocumentNode, head: ElementNode, body: ElementNode): void {
    // 提取 title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      doc.setTitle(titleMatch[1]);
    }
    
    // 提取 body 内容
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;
    
    // 简单解析标签和文本
    this._parseElements(content, doc, body);
  }
  
  private _parseElements(html: string, doc: DocumentNode, parent: ElementNode): void {
    // 移除 script 和 style
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // 解析主要元素
    const tagRegex = /<(\/?)([\w]+)([^>]*)>|([^<]+)/g;
    let match;
    const stack: ElementNode[] = [parent];
    
    while ((match = tagRegex.exec(html)) !== null) {
      const [/* full */, isClosing, tagName, attrs, text] = match;
      
      if (text) {
        // 文本内容
        const trimmed = text.trim();
        if (trimmed && stack.length > 0) {
          const textNode = doc.createTextNode(trimmed);
          stack[stack.length - 1].appendChild(textNode);
        }
      } else if (tagName) {
        const lowerTag = tagName.toLowerCase();
        
        if (isClosing) {
          // 结束标签
          if (stack.length > 1 && stack[stack.length - 1].nodeName === lowerTag) {
            stack.pop();
          }
        } else {
          // 开始标签
          const element = doc.createElement(lowerTag);
          
          // 解析属性
          if (attrs) {
            const attrRegex = /([\w-]+)(?:=["']([^"']*)["'])?/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrs)) !== null) {
              element.setAttribute(attrMatch[1], attrMatch[2] || '');
            }
          }
          
          stack[stack.length - 1].appendChild(element);
          
          // 非自闭合标签入栈
          if (!['br', 'hr', 'img', 'input', 'meta', 'link'].includes(lowerTag)) {
            stack.push(element);
          }
        }
      }
    }
  }
}

// ============================================
// 布局引擎（简化版）
// ============================================

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
  node: DOMNode;
  children: LayoutBox[];
  style: Record<string, string>;
  textContent?: string;
}

export class LayoutEngine {
  constructor(private viewportWidth: number, private viewportHeight: number) {}
  
  layout(root: ElementNode): LayoutBox {
    return this._layoutElement(root, 0, 0, this.viewportWidth);
  }
  
  private _layoutElement(element: ElementNode, x: number, y: number, width: number): LayoutBox {
    const style: Record<string, string> = {};
    
    // 从元素获取样式
    const styleAttr = element.getAttribute('style') || '';
    styleAttr.split(';').forEach(part => {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) style[key] = value;
    });
    
    // 默认样式
    const display = style['display'] || 'block';
    if (display === 'none') {
      return { x, y, width: 0, height: 0, node: element, children: [], style };
    }
    
    const children: LayoutBox[] = [];
    let currentY = y;
    const currentX = x;
    let totalHeight = 0;
    
    // 布局子节点
    for (const child of element.childNodes) {
      if (child.nodeType === NodeType.TEXT_NODE) {
        const text = child.textContent || '';
        if (text.trim()) {
          const fontSize = parseInt(style['font-size']) || 16;
          const lineHeight = fontSize * 1.5;
          
          // 简单文本换行
          const charWidth = fontSize * 0.6;
          const maxChars = Math.floor(width / charWidth);
          const lines = Math.ceil(text.length / Math.max(1, maxChars));
          const textHeight = lines * lineHeight;
          
          children.push({
            x: currentX,
            y: currentY,
            width: Math.min(text.length * charWidth, width),
            height: textHeight,
            node: child,
            children: [],
            style,
            textContent: text,
          });
          
          totalHeight += textHeight;
          currentY += textHeight;
        }
      } else if (child instanceof ElementNode) {
        const childBox = this._layoutElement(child, currentX, currentY, width);
        children.push(childBox);
        currentY = childBox.y + childBox.height;
        totalHeight = currentY - y;
      }
    }
    
    // 解析高度
    let height = totalHeight;
    if (style['height']) {
      const h = parseInt(style['height']);
      if (!isNaN(h)) height = h;
    }
    
    // 解析边距
    const padding = this._parseSize(style['padding'] || '0');
    const margin = this._parseSize(style['margin'] || '8');
    
    return {
      x: x + margin,
      y: y + margin,
      width: width - margin * 2,
      height: height + padding * 2,
      node: element,
      children,
      style,
    };
  }
  
  private _parseSize(value: string): number {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

// ============================================
// 绘制引擎（简化版）
// ============================================

export interface TextFragment {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
}

export class PaintEngine {
  paint(rootBox: LayoutBox, ctx: CanvasRenderingContext2D): TextFragment[] {
    const fragments: TextFragment[] = [];
    
    // 清除画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 绘制
    this._paintBox(rootBox, ctx, fragments);
    
    return fragments;
  }
  
  private _paintBox(box: LayoutBox, ctx: CanvasRenderingContext2D, fragments: TextFragment[]): void {
    const { x, y, width, height, style, node, children, textContent } = box;
    
    // 绘制背景
    const bgColor = style['background-color'] || style['background'];
    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, width, height);
    }
    
    // 绘制边框
    const borderColor = style['border-color'];
    const borderWidth = parseInt(style['border-width']) || 0;
    if (borderColor && borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(x, y, width, height);
    }
    
    // 绘制文本
    if (textContent && node.nodeType === NodeType.TEXT_NODE) {
      const fontSize = parseInt(style['font-size']) || 16;
      const fontFamily = style['font-family'] || 'system-ui, sans-serif';
      const fontWeight = style['font-weight'] || 'normal';
      const color = style['color'] || '#000000';
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      
      // 简单换行
      const charWidth = fontSize * 0.6;
      const maxChars = Math.floor(width / charWidth);
      const lines = this._wrapText(textContent, maxChars);
      
      let lineY = y;
      for (const line of lines) {
        ctx.fillText(line, x, lineY);
        fragments.push({
          text: line,
          x,
          y: lineY,
          width: line.length * charWidth,
          height: fontSize * 1.5,
          fontSize,
          color,
        });
        lineY += fontSize * 1.5;
      }
    }
    
    // 递归绘制子节点
    for (const child of children) {
      this._paintBox(child, ctx, fragments);
    }
  }
  
  private _wrapText(text: string, maxChars: number): string[] {
    if (maxChars <= 0) return [text];
    
    const lines: string[] = [];
    const words = text.split(/\s+/);
    let current = '';
    
    for (const word of words) {
      if (current.length + word.length + 1 <= maxChars) {
        current = current ? current + ' ' + word : word;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [text];
  }
}

// ============================================
// 浏览器内核
// ============================================

export interface RenderResult {
  document: DocumentNode;
  layout: LayoutBox | null;
  textFragments: TextFragment[];
  title: string;
}

export class BrowserKernel {
  private _parser: HTMLParser;
  private _layoutEngine: LayoutEngine;
  private _paintEngine: PaintEngine;
  private _document: DocumentNode | null = null;
  private _layout: LayoutBox | null = null;
  
  constructor(viewportWidth: number, viewportHeight: number) {
    this._parser = new HTMLParser();
    this._layoutEngine = new LayoutEngine(viewportWidth, viewportHeight);
    this._paintEngine = new PaintEngine();
  }
  
  render(html: string, _url: string, _viewportWidth: number, _viewportHeight: number): RenderResult {
    console.log('[BrowserKernel] Rendering HTML');
    
    // 解析
    this._document = this._parser.parse(html);
    
    // 布局
    if (this._document.documentElement) {
      const body = this._document.documentElement.childNodes.find(
        c => c instanceof ElementNode && c.nodeName === 'body'
      ) as ElementNode | undefined;
      
      if (body) {
        this._layout = this._layoutEngine.layout(body);
        console.log('[BrowserKernel] Layout:', this._layout);
      }
    }
    
    return {
      document: this._document,
      layout: this._layout,
      textFragments: [],
      title: this._document.getTitle() || 'Untitled',
    };
  }
  
  paint(ctx: CanvasRenderingContext2D): TextFragment[] {
    if (!this._layout) {
      console.log('[BrowserKernel] No layout');
      return [];
    }
    
    console.log('[BrowserKernel] Painting');
    return this._paintEngine.paint(this._layout, ctx);
  }
  
  getLayout(): LayoutBox | null {
    return this._layout;
  }
  
  getTextFragments(): TextFragment[] {
    return [];
  }
  
  getDocument(): DocumentNode | null {
    return this._document;
  }
}
