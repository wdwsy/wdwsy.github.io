'use strict';

const codeLanguages = {
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  bash: 'Bash',
  javascript: 'JavaScript',
  js: 'JavaScript',
  markdown: 'Markdown',
  md: 'Markdown',
  python: 'Python',
  py: 'Python',
  plaintext: '纯文本',
  text: '纯文本'
};

const codePreviewLines = 20;
let codeBodyCount = 0;

function addCodeToggle(card, body, block, rows) {
  if (rows.length) {
    const tailRows = Array.from(rows).slice(codePreviewLines);
    const tailNumbers = Array.from(block.querySelectorAll('.gutter pre > .line')).slice(codePreviewLines);
    for (const line of tailRows.concat(tailNumbers)) {
      line.classList.add('blog-code-tail');
      const lineBreak = line.nextElementSibling;
      if (lineBreak?.matches('br')) lineBreak.classList.add('blog-code-tail');
    }
  } else {
    block.classList.add('blog-code-raw');
    block.style.setProperty('--blog-code-preview-lines', codePreviewLines);
  }

  const footer = document.createElement('div');
  footer.className = 'blog-code-footer';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'blog-code-toggle';
  toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  body.id = 'blog-code-body-' + ++codeBodyCount;
  toggle.setAttribute('aria-controls', body.id);

  function setExpanded(expanded) {
    card.classList.toggle('blog-code-collapsed', !expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? '收起代码' : '展开全部代码');
  }

  setExpanded(false);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'false';
    setExpanded(expanded);
    if (!expanded && toggle.getBoundingClientRect().top < 0) {
      toggle.scrollIntoView({ block: 'nearest' });
    }
  });
  footer.append(toggle);
  card.append(footer);
}

function enhanceCodeBlocks() {
  const blocks = document.querySelectorAll('.post-body figure.highlight, .post-body pre');
  for (const block of blocks) {
    if (block.matches('pre') && block.closest('figure.highlight')) continue;
    if (block.closest('.blog-code') || block.querySelector('.mermaid')) continue;

    const language = block.matches('figure')
      ? [...block.classList].find(name => name !== 'highlight')
      : block.querySelector('code')?.className.match(/\blanguage-([\w+#-]+)/)?.[1];
    const label = Object.hasOwn(codeLanguages, language) ? codeLanguages[language] : language || '代码';
    const rows = block.querySelectorAll('.code pre > .line');
    const codeText = block.querySelector('.code pre') || block.querySelector('pre code, code, pre') || block;
    const lineCount = rows.length || codeText.textContent.replace(/\r?\n$/, '').split(/\r\n?|\n/).length;

    const parent = block.parentElement;
    const previousSummary = parent.querySelector(':scope > summary');
    const standaloneDisclosure = parent.matches('details') && previousSummary &&
      parent.childElementCount === 2 &&
      [...parent.childNodes].every(node => node.nodeType !== Node.TEXT_NODE || !node.textContent.trim());

    const card = document.createElement('div');
    card.className = 'blog-code notranslate';
    const header = document.createElement('div');
    header.className = 'blog-code-header';
    header.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18"/></svg>';

    const name = document.createElement('span');
    name.className = 'blog-code-language';
    name.textContent = label;
    header.append(name);

    if (standaloneDisclosure) {
      const caption = document.createElement('span');
      caption.className = 'blog-code-caption';
      caption.append(...previousSummary.childNodes);
      if (caption.firstChild?.nodeType === Node.TEXT_NODE) {
        caption.firstChild.textContent = caption.firstChild.textContent.replace(/^\s*(?:📂\s*)?点击展开[：:]\s*/, '');
      }
      if (caption.textContent.trim() || caption.childElementCount) header.append(caption);
      if (parent.id) card.id = parent.id;
      parent.replaceWith(card);
    } else {
      block.before(card);
    }

    const copy = document.createElement('button');
    copy.className = 'blog-code-copy';
    copy.type = 'button';
    copy.setAttribute('aria-label', '复制代码');
    copy.title = '复制代码';
    copy.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
    const status = document.createElement('span');
    status.className = 'blog-code-status';
    status.setAttribute('role', 'status');
    header.append(status, copy);

    const body = document.createElement('div');
    body.className = 'blog-code-body';
    body.append(block);
    card.append(header, body);
    if (lineCount > codePreviewLines) addCodeToggle(card, body, block, rows);

    let clearStatus;
    copy.addEventListener('click', async () => {
      const source = rows.length
        ? Array.from(rows, row => row.textContent).join('\n')
        : codeText.textContent;
      try {
        await navigator.clipboard.writeText(source);
        status.textContent = '已复制';
      } catch {
        status.textContent = '复制失败';
      }
      clearTimeout(clearStatus);
      clearStatus = setTimeout(() => { status.textContent = ''; }, 1800);
    });
  }
}

document.addEventListener('page:loaded', enhanceCodeBlocks);
