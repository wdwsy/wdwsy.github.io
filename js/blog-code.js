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

function enhanceCodeBlocks() {
  const blocks = document.querySelectorAll('.post-body figure.highlight, .post-body pre');
  for (const block of blocks) {
    if (block.matches('pre') && block.closest('figure.highlight')) continue;
    if (block.closest('.blog-code') || block.querySelector('.mermaid')) continue;

    const language = block.matches('figure')
      ? [...block.classList].find(name => name !== 'highlight')
      : block.querySelector('code')?.className.match(/\blanguage-([\w+#-]+)/)?.[1];
    const label = Object.hasOwn(codeLanguages, language) ? codeLanguages[language] : language || '代码';

    const parent = block.parentElement;
    const previousSummary = parent.querySelector(':scope > summary');
    const standaloneDisclosure = parent.matches('details') && previousSummary &&
      parent.childElementCount === 2 &&
      [...parent.childNodes].every(node => node.nodeType !== Node.TEXT_NODE || !node.textContent.trim());
    const card = document.createElement('div');
    card.className = 'blog-code notranslate';
    const fold = standaloneDisclosure ? parent : document.createElement('details');
    const summary = standaloneDisclosure ? previousSummary : document.createElement('summary');
    if (standaloneDisclosure) {
      fold.before(card);
    } else {
      block.before(card);
      fold.append(summary, block);
    }
    fold.classList.add('blog-code-fold');
    fold.open = false;
    card.append(fold);

    const caption = document.createElement('span');
    caption.className = 'blog-code-caption';
    caption.append(...summary.childNodes);
    if (caption.firstChild?.nodeType === Node.TEXT_NODE) {
      caption.firstChild.textContent = caption.firstChild.textContent.replace(/^\s*(?:📂\s*)?点击展开[：:]\s*/, '');
    }

    const name = document.createElement('span');
    name.className = 'blog-code-language';
    name.textContent = label;
    summary.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18"/></svg>';
    summary.append(name);
    if (caption.textContent.trim() || caption.childElementCount) summary.append(caption);
    summary.insertAdjacentHTML('beforeend', '<svg class="blog-code-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>');

    const copy = document.createElement('button');
    copy.className = 'blog-code-copy';
    copy.type = 'button';
    copy.setAttribute('aria-label', '复制代码');
    copy.title = '复制代码';
    copy.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
    const status = document.createElement('span');
    status.className = 'blog-code-status';
    status.setAttribute('role', 'status');
    card.append(copy, status);

    let clearStatus;
    copy.addEventListener('click', async () => {
      const lines = block.querySelectorAll('.code pre > .line');
      const source = lines.length
        ? [...lines].map(line => line.textContent).join('\n')
        : (block.querySelector('pre code, pre, code') || block).textContent;
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
