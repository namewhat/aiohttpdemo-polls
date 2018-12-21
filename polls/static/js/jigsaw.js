(function(window) {
    const l = 42
      , // 滑块边长
    r = 10
      , // 滑块半径
    w = 350
      , // canvas宽度
    h = 50
      , // canvas高度
    PI = Math.PI
    const L = l + r * 2
    // 滑块实际边长

    function getRandomNumberByRange(start, end) {
        return Math.round(Math.random() * (end - start) + start)
    }

    function createCanvas(width, height) {
        const canvas = createElement('canvas')
        canvas.width = width
        canvas.height = height
        return canvas
    }

    function createImg(onload) {
        const img = createElement('img')
        img.crossOrigin = "Anonymous"
        img.onload = onload
        img.onerror = ()=>{
            img.src = getRandomImg()
        }
        img.src = getRandomImg()
        return img
    }

    function createElement(tagName) {
        return document.createElement(tagName)
    }

    function addClass(tag, className) {
        tag.classList.add(className)
    }

    function removeClass(tag, className) {
        tag.classList.remove(className)
    }

    function getRandomImg() {
        return 'https://picsum.photos/300/150/?image=' + getRandomNumberByRange(0, 100)
    }

    function draw(ctx, operation, x, y) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + l / 2, y)
        ctx.arc(x + l / 2, y - r + 2, r, 0, 2 * PI)
        ctx.lineTo(x + l / 2, y)
        ctx.lineTo(x + l, y)
        ctx.lineTo(x + l, y + l / 2)
        ctx.arc(x + l + r - 2, y + l / 2, r, 0, 2 * PI)
        ctx.lineTo(x + l, y + l / 2)
        ctx.lineTo(x + l, y + l)
        ctx.lineTo(x, y + l)
        ctx.lineTo(x, y)
        ctx.fillStyle = '#fff'
        ctx[operation]()
        ctx.beginPath()
        ctx.arc(x, y + l / 2, r, 1.5 * PI, 0.5 * PI)
        ctx.globalCompositeOperation = "xor"
        ctx.fill()
    }

    function sum(x, y) {
        return x + y
    }

    function square(x) {
        return x * x
    }

    class jigsaw {
        constructor(el) {
            this.el = el;
            this.elMsg = document.getElementById('msg');
            this.elVerify = document.getElementById('verify');
        }

        init() {
            this.initDOM()
            this.initImg()
            this.draw()
            this.bindEvents()
        }

        initDOM() {
            const canvas = createCanvas(w, h)
            // 画布
            const block = canvas.cloneNode(true)
            // 滑块
            const sliderContainer = createElement('div')
            const refreshIcon = createElement('div')
            const sliderMask = createElement('div')
            const slider = createElement('div')
            const sliderIcon = createElement('span')
            const text = createElement('span')

            block.className = 'block'
            sliderContainer.className = 'sliderContainer'
            refreshIcon.className = 'refreshIcon'
            sliderMask.className = 'sliderMask'
            slider.className = 'slider'
            sliderIcon.className = 'sliderIcon'
            text.innerHTML = '向右滑动滑块填充拼图'
            text.className = 'sliderText'

            const el = this.el
            el.appendChild(canvas)
            el.appendChild(refreshIcon)
            el.appendChild(block)
            slider.appendChild(sliderIcon)
            sliderMask.appendChild(slider)
            sliderContainer.appendChild(sliderMask)
            sliderContainer.appendChild(text)
            el.appendChild(sliderContainer)

            Object.assign(this, {
                canvas,
                block,
                sliderContainer,
                refreshIcon,
                slider,
                sliderMask,
                sliderIcon,
                text,
                canvasCtx: canvas.getContext('2d'),
                blockCtx: block.getContext('2d')
            })
        }

        initImg() {
            const img = createImg(()=>{
                this.canvasCtx.drawImage(img, 0, 0, w, h)
                this.blockCtx.drawImage(img, 0, 0, w, h)
                const y = this.y - r * 2 + 2
                const ImageData = this.blockCtx.getImageData(this.x, y, L, L)
                this.block.width = L
                this.blockCtx.putImageData(ImageData, 0, y)
            }
            )
            this.img = img
        }

        draw() {
            // 随机创建滑块的位置
            this.x = getRandomNumberByRange(L + 10, w - (L + 10))
            this.y = getRandomNumberByRange(10 + r * 2, h - (L + 10))
            draw(this.canvasCtx, 'fill', this.x, this.y)
            draw(this.blockCtx, 'clip', this.x, this.y)
        }

        clean() {
            this.canvasCtx.clearRect(0, 0, w, h)
            this.blockCtx.clearRect(0, 0, w, h)
            this.block.width = w
        }

        bindEvents() {
            this.el.onselectstart = ()=>false; // 禁止选中
            this.refreshIcon.onclick = ()=>{ // 点击刷新
                this.reset();
                this.setVerifyMessage();
            }

            let originX, originY, trail = [], isMouseDown = false
            // 鼠标左键按下事件
            this.slider.addEventListener('mousedown', function(e) {
                originX = e.x,
                originY = e.y
                isMouseDown = true
            });

            // 鼠标拖拽事件
            document.addEventListener('mousemove', (e)=>{
                if (!isMouseDown) {
                    return false;
                }
                const moveX = e.x - originX; // 元素移动X轴距离
                const moveY = e.y - originY; // 元素移动Y轴距离
                if (moveX < 0 || moveX + 38 >= w) { // 元素移动半径超出范围
                    return false;
                }
                this.slider.style.left = moveX + 'px';
                var blockLeft = (w - 40 - 20) / (w - 40) * moveX
                this.block.style.left = blockLeft + 'px'

                addClass(this.sliderContainer, 'sliderContainer_active')
                this.sliderMask.style.width = moveX + 'px'
                trail.push(moveY)
            });

            // 鼠标左键松开事件
            document.addEventListener('mouseup', (e)=>{
                if (!isMouseDown) {
                    return false;
                }
                isMouseDown = false
                if (e.x == originX) {
                    return false;
                }
                removeClass(this.sliderContainer, 'sliderContainer_active');
                this.trail = trail;

                const {spliced, TuringTest} = this.verify(); // 验证动作

                if (spliced) {
                    if (TuringTest) {
                        addClass(this.sliderContainer, 'sliderContainer_success');
                        // this.success && this.success();
                        this.success();
                    } else {
                        addClass(this.sliderContainer, 'sliderContainer_fail')
                        this.text.innerHTML = '再试一次';
                        this.reset();
                    }
                } else {
                    addClass(this.sliderContainer, 'sliderContainer_fail');
                    // this.fail && this.fail();
                    this.fail();
                    setTimeout(()=>{
                        this.reset();
                    }, 0)
                }
            }
            )
        }

        verify() {
            const arr = this.trail;
            // 拖动时y轴的移动距离
            const average = arr.reduce(sum) / arr.length;
            // 平均值
            const deviations = arr.map(x=>x - average);
            // 偏差数组
            const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length);
            // 标准差
            const left = parseInt(this.block.style.left);
            return {
                spliced: Math.abs(left - this.x) < 2, // 吻合误差
                TuringTest: average !== stddev,
                // 只是简单的验证拖动轨迹，相等时一般为0，表示可能非人为操作
            };
        }

        reset() {
            this.sliderContainer.className = 'sliderContainer';
            this.slider.style.left = 0;
            this.block.style.left = 0;
            this.sliderMask.style.width = 0;
            this.clean();
            this.img.src = getRandomImg();
            this.draw();
        }

        success() {
            this.setVerifyMessage('验证成功!', 1);
        }

        fail() {
            this.setVerifyMessage('请重试!');
        }

        setVerifyMessage(msg='', code='') {
            this.elMsg.innerText = msg;
            // 修改验证结果
            this.elVerify.value = code;
            // 触发事件
            Config.trigger(this.elVerify, 'change');
        }
    }

    window.jigsaw = {
        init: function(element) {
            new jigsaw(element).init();
        }
    }
}(window))
