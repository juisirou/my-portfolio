// 背景色アニメーション - スクロール位置でページ全体の背景色を切り替え
document.addEventListener('DOMContentLoaded', function() {
    // data-bg-color属性を持つ全てのセクションを取得
    const sections = document.querySelectorAll('[data-bg-color]');
    const defaultBgColor = '#d4ccc4'; // デフォルトの背景色
    // 判定基準（ビューポート上端からの割合）。値を大きくすると「より早く」切り替わる
    const rawTriggerOffsetRatio = 1.5; // 例: 0.25 = 画面上から1/4の位置    // 0〜1の範囲に収める（1超えやマイナスだと「動いてない」ように見えやすい）
    const triggerOffsetRatio = Math.min(1, Math.max(0, rawTriggerOffsetRatio));
    
    // スクロールイベントで背景色を切り替え
    function updateBackgroundColor() {
        let newColor = defaultBgColor;
        // 画面上から triggerOffsetRatio の位置（仮想の判定ライン）を基準にする
        const triggerLineY = window.scrollY + window.innerHeight * triggerOffsetRatio;
    

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + section.offsetHeight;

            if (triggerLineY >= elementTop && triggerLineY < elementBottom) {
                const candidate = section.getAttribute('data-bg-color');
                // 無効な色（例: "#"）は無視して、背景色が壊れないようにする
                if (candidate && CSS.supports('color', candidate)) {
                    newColor = candidate;
                }
            }
        });

        // ヘッダーの背景色を先に設定（bodyと同時に変わるように）
        const header = document.querySelector('.site-header .desktop');
        if (header) {
            header.style.backgroundColor = newColor;
        }
        
        document.body.style.backgroundColor = newColor;
    }

    // フェードイン表示 - .fade 要素が画面内に入ったら is-show を付与
    const fades = document.querySelectorAll('.fade');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-show');
          observer.unobserve(entry.target); // 1回だけ
        }
      });
    });
    
    fades.forEach(el => observer.observe(el));
    



    window.addEventListener('scroll', updateBackgroundColor, { passive: true });
    updateBackgroundColor(); // 初期化時に実行
    
    

    // ========================================
    // 画像スライダー（ボタン＋インジケーター付き）
    // ========================================
    const slide = document.getElementById('slide');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const indicator = document.getElementById('indicator');
    
    if (slide && prev && next && indicator) {
        const totalSlides = slide.querySelectorAll('.item').length;
        let count = 0;
        let autoPlayInterval;
        let lists;

        // ドット（インジケーター）をスライド枚数に合わせて自動生成
        function syncIndicator() {
            // 既存が枚数と違う/空なら作り直す（HTMLを手で増減しなくてOK）
            if (indicator.querySelectorAll('.list').length !== totalSlides) {
                indicator.innerHTML = '';
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'list';
                    indicator.appendChild(dot);
                }
            }
            lists = indicator.querySelectorAll('.list');
        }

        // 現在のスライドへ移動（%で動かすのでレスポンシブ対応）
        function goTo(index) {
            count = (index + totalSlides) % totalSlides;
            slide.style.transform = `translateX(-${count * 100}%)`;
            updateListBackground();
        }

        // インジケーターの見た目を更新（CSSクラスで制御）
        function updateListBackground() {
            if (!lists) return;
            for (let i = 0; i < lists.length; i++) {
                lists[i].classList.toggle('is-active', i === count);
            }
        }

        // 次のスライドに移動
        function nextClick() {
            goTo(count + 1);
        }

        // 前のスライドに移動
        function prevClick() {
            goTo(count - 1);
        }

        // 自動再生開始
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextClick, 3000); // 3秒ごと
        }

        // 自動再生リセット
        function resetAutoPlayInterval() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // 次ボタンクリック
        next.addEventListener('click', () => {
            nextClick();
            resetAutoPlayInterval();
        });

        // 前ボタンクリック
        prev.addEventListener('click', () => {
            prevClick();
            resetAutoPlayInterval();
        });

        // インジケータークリック
        indicator.addEventListener('click', (event) => {
            if (event.target.classList.contains('list')) {
                const index = Array.from(lists).indexOf(event.target);
                goTo(index);
                resetAutoPlayInterval();
            }
        });

        // 初期化
        syncIndicator();
        goTo(0); // 最初のスライドを表示
        startAutoPlay();
        
        console.log(`🎬 スライダー初期化完了: ${totalSlides}枚の画像、3秒ごとに自動再生`);
    }

});
