chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleOverlay") toggleUI();
});

function toggleUI() {
    let existingUI = document.getElementById("discord-search-floating-box");
    if (existingUI) {
        existingUI.remove();
        return;
    }

    let searchResults = [];
    let currentIndex  = 0;

    // ─── Container ────────────────────────────────────────────────────────────
    const container = document.createElement('div');
    container.id = "discord-search-floating-box";
    container.style.cssText = `
        position: fixed;
        top: auto;
        bottom: 20px;
        left: auto;
        right: 20px;
        width: 440px;
        min-width: 300px;
        min-height: 220px;
        background: #ffffff;
        border: 2px solid #5865F2;
        border-radius: 12px;
        z-index: 2147483647;
        padding: 0;
        box-shadow: 0 8px 32px rgba(88,101,242,0.3);
        font-family: 'Segoe UI', Tahoma, sans-serif;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        overflow: hidden;
        resize: both;
        box-sizing: border-box;
    `;

    container.innerHTML = `
        <style>
            #discord-search-floating-box *, #discord-search-floating-box *::before, #discord-search-floating-box *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            #discord-search-floating-box button { cursor: pointer; transition: filter 0.15s, opacity 0.15s; }
            #discord-search-floating-box button:hover { filter: brightness(0.88); }
            #discord-search-floating-box select, #discord-search-floating-box input {
                font-family: inherit;
            }
            #discord-search-floating-box select:focus,
            #discord-search-floating-box input:focus {
                outline: 2px solid #5865F2;
                outline-offset: 1px;
            }
            #ds-drag-handle { cursor: grab; user-select: none; }
            #ds-drag-handle:active { cursor: grabbing; }

            .ds-tab-btn {
                cursor: pointer;
                padding: 6px 14px;
                border-radius: 6px 6px 0 0;
                font-size: 12px;
                font-weight: 700;
                border: 1.5px solid transparent;
                border-bottom: none;
                background: #eef0ff;
                color: #5865F2;
                transition: background 0.15s, color 0.15s;
                letter-spacing: 0.2px;
            }
            .ds-tab-btn.active {
                background: #5865F2;
                color: #ffffff;
            }
            .ds-tab-btn:hover:not(.active) {
                background: #d8dcff;
            }

            .ds-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 5px 12px;
                border-radius: 20px;
                border: 1.5px solid #5865F2;
                background: white;
                color: #5865F2;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                white-space: nowrap;
                font-family: inherit;
            }
            .ds-chip:hover, .ds-chip.selected {
                background: #5865F2;
                color: white;
            }

            .ds-subject-btn {
                width: 100%;
                text-align: left;
                padding: 9px 12px;
                border: 1.5px solid #ddd;
                border-radius: 8px;
                background: white;
                font-size: 13px;
                cursor: pointer;
                margin-bottom: 5px;
                transition: all 0.15s;
                color: #333;
                font-family: inherit;
                font-weight: 500;
            }
            .ds-subject-btn:hover {
                background: #eef0ff;
                border-color: #5865F2;
                color: #5865F2;
            }

            #ds-body::-webkit-scrollbar { width: 5px; }
            #ds-body::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 3px; }
            #ds-body::-webkit-scrollbar-thumb { background: #c5c9f5; border-radius: 3px; }

            #ds-resize-corner {
                position: absolute;
                bottom: 3px;
                right: 5px;
                font-size: 11px;
                color: #ccc;
                pointer-events: none;
                line-height: 1;
            }

            /* URL hint label in manual tab */
            #ds-url-hint {
                display: none;
                padding: 6px 10px;
                background: #eef0ff;
                border-radius: 6px;
                font-size: 11px;
                color: #5865F2;
                font-weight: 600;
                line-height: 1.4;
                word-break: break-all;
            }
        </style>

        <!-- ── Header / Drag Handle ── -->
        <div id="ds-drag-handle" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #5865F2;
            padding: 11px 14px;
            border-radius: 10px 10px 0 0;
            flex-shrink: 0;
        ">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:17px; line-height:1;">🔍</span>
                <span style="color:white; font-weight:700; font-size:15px; letter-spacing:0.3px;">Discord Search</span>
                <span style="color:rgba(255,255,255,0.5); font-size:10px; margin-top:1px;">v1.2</span>
            </div>
            <button id="ds-close-btn" style="
                background: rgba(255,255,255,0.18);
                border: none;
                color: white;
                font-size: 14px;
                border-radius: 50%;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                line-height: 1;
            ">✕</button>
        </div>

        <!-- ── Tabs ── -->
        <div style="
            display: flex;
            gap: 4px;
            padding: 10px 14px 0;
            flex-shrink: 0;
            background: #fafbff;
            border-bottom: 2px solid #5865F2;
        ">
            <button class="ds-tab-btn active" data-tab="auto">⚡ Auto</button>
            <button class="ds-tab-btn" data-tab="manual">✏️ Manual</button>
        </div>

        <!-- ── Scrollable Body ── -->
        <div id="ds-body" style="
            flex: 1;
            overflow-y: auto;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        ">
            <!-- Server mode -->
            <select id="ds-mode" style="
                width: 100%;
                padding: 8px 10px;
                border: 1.5px solid #ddd;
                border-radius: 8px;
                font-size: 13px;
                color: #333;
                background: white;
            ">
                <option value="ngrok">🌐 Remote (EC2)</option>
                <option value="local">🖥️ Localhost (5000)</option>
            </select>

            <!-- ── AUTO TAB ── -->
            <div id="ds-tab-auto" style="display:flex; flex-direction:column; gap:10px;">
                <button id="ds-search-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                ">🔍 ดึงโจทย์ &amp; ค้นหา</button>

                <!-- Keyword chooser (text vs image) -->
                <div id="ds-keyword-chooser" style="display:none; flex-direction:column; gap:7px;">
                    <div style="font-size:11px; color:#888; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                        เลือก keyword ที่ต้องการค้นหา
                    </div>
                    <div id="ds-keyword-chips" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                </div>

                <!-- Keyword debug -->
                <div id="ds-keyword-display" style="
                    display: none;
                    font-size: 11px;
                    color: #666;
                    background: #eef0ff;
                    border-radius: 6px;
                    padding: 6px 10px;
                    word-break: break-all;
                    line-height: 1.5;
                "></div>
            </div>

            <!-- ── MANUAL TAB ── -->
            <div id="ds-tab-manual" style="display:none; flex-direction:column; gap:8px;">
                <input
                    id="ds-manual-input"
                    type="text"
                    placeholder="พิมพ์ keyword หรือวาง URL รูปภาพ..."
                    style="
                        width: 100%;
                        padding: 10px 12px;
                        border: 1.5px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #333;
                        background: white;
                    "
                />
                <!-- URL hint: shows extracted keyword when image URL is detected -->
                <div id="ds-url-hint"></div>

                <button id="ds-manual-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 700;
                ">🔍 ค้นหา</button>
            </div>

            <!-- Subject chooser (multiple categories) -->
            <div id="ds-subject-chooser" style="display:none; flex-direction:column; gap:7px;">
                <div style="font-size:11px; color:#888; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                    พบหลายวิชา — เลือกวิชาที่ต้องการดู
                </div>
                <div id="ds-subject-list"></div>
                <button id="ds-subject-all-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: white;
                    color: #5865F2;
                    border: 1.5px solid #5865F2;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                ">📋 แสดงทั้งหมด</button>
            </div>

            <!-- Result -->
            <div id="ds-result" style="
                background: #f8f9fa;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
                font-size: 14px;
                white-space: pre-wrap;
                min-height: 130px;
                user-select: text;
                line-height: 1.7;
                color: #333;
            ">ผลลัพธ์จะแสดงที่นี่...</div>

            <!-- Pagination -->
            <div id="ds-pagination" style="display:none; justify-content:space-between; align-items:center; gap:8px;">
                <button id="ds-prev-btn" style="
                    padding: 8px 14px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 13px;
                ">◀ ก่อนหน้า</button>
                <span id="ds-page-info" style="font-size:13px; font-weight:700; color:#444;">1 / 1</span>
                <button id="ds-next-btn" style="
                    padding: 8px 14px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 13px;
                ">ถัดไป ▶</button>
            </div>
        </div>

        <div id="ds-resize-corner">⇲</div>
    `;

    document.body.appendChild(container);

    // ─── Refs ─────────────────────────────────────────────────────────────────
    const resultDiv        = document.getElementById('ds-result');
    const paginationDiv    = document.getElementById('ds-pagination');
    const prevBtn          = document.getElementById('ds-prev-btn');
    const nextBtn          = document.getElementById('ds-next-btn');
    const pageInfo         = document.getElementById('ds-page-info');
    const keywordDisplay   = document.getElementById('ds-keyword-display');
    const keywordChooser   = document.getElementById('ds-keyword-chooser');
    const keywordChips     = document.getElementById('ds-keyword-chips');
    const subjectChooser   = document.getElementById('ds-subject-chooser');
    const subjectList      = document.getElementById('ds-subject-list');
    const modeSelect       = document.getElementById('ds-mode');
    const manualInput      = document.getElementById('ds-manual-input');
    const urlHint          = document.getElementById('ds-url-hint');

    document.getElementById('ds-close-btn').addEventListener('click', () => container.remove());

    // ─── Helper: extract keyword from raw input ───────────────────────────────
    // If the value looks like an image URL, pull the filename (e.g. QI2408834)
    // Otherwise return the trimmed value as-is.
    function extractKeyword(value) {
        const m = value.match(/\/([A-Za-z0-9_]+)\.(jpg|jpeg|png|gif)/i);
        if (m && m[1]) return m[1];
        return value.trim();
    }

    // ─── Manual input: live URL detection hint ────────────────────────────────
    manualInput.addEventListener('input', () => {
        const val = manualInput.value.trim();
        if (val.startsWith('http') && /\/([A-Za-z0-9_]+)\.(jpg|jpeg|png|gif)/i.test(val)) {
            const kw = extractKeyword(val);
            urlHint.style.display = 'block';
            urlHint.textContent   = '🖼️ ตรวจพบ URL รูปภาพ → keyword: "' + kw + '"';
        } else {
            urlHint.style.display = 'none';
        }
    });

    // ─── Tab switching ────────────────────────────────────────────────────────
    document.querySelectorAll('.ds-tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ds-tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const which = tab.dataset.tab;
            const autoTab   = document.getElementById('ds-tab-auto');
            const manualTab = document.getElementById('ds-tab-manual');
            if (which === 'auto') {
                autoTab.style.display   = 'flex';
                manualTab.style.display = 'none';
            } else {
                autoTab.style.display   = 'none';
                manualTab.style.display = 'flex';
            }
        });
    });

    // ─── Drag (PiP style) ─────────────────────────────────────────────────────
    const dragHandle = document.getElementById('ds-drag-handle');
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0, origLeft = 0, origTop = 0;

    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.id === 'ds-close-btn') return;
        isDragging = true;
        const rect = container.getBoundingClientRect();
        container.style.bottom = 'auto';
        container.style.right  = 'auto';
        container.style.top    = rect.top  + 'px';
        container.style.left   = rect.left + 'px';
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        origLeft   = rect.left;
        origTop    = rect.top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = origLeft + (e.clientX - dragStartX);
        let newTop  = origTop  + (e.clientY - dragStartY);
        newLeft = Math.max(0, Math.min(window.innerWidth  - container.offsetWidth,  newLeft));
        newTop  = Math.max(0, Math.min(window.innerHeight - container.offsetHeight, newTop));
        container.style.left = newLeft + 'px';
        container.style.top  = newTop  + 'px';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    // ─── Pagination ───────────────────────────────────────────────────────────
    function updateDisplay() {
        if (searchResults.length === 0) return;
        resultDiv.innerText = searchResults[currentIndex];
        pageInfo.innerText  = `${currentIndex + 1} / ${searchResults.length}`;
        prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
        prevBtn.style.cursor  = currentIndex === 0 ? 'default' : 'pointer';
        nextBtn.style.opacity = currentIndex === searchResults.length - 1 ? '0.35' : '1';
        nextBtn.style.cursor  = currentIndex === searchResults.length - 1 ? 'default' : 'pointer';
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) { currentIndex--; updateDisplay(); }
    });
    nextBtn.addEventListener('click', () => {
        if (currentIndex < searchResults.length - 1) { currentIndex++; updateDisplay(); }
    });

    // ─── Flatten result items to strings ──────────────────────────────────────
    function flattenResults(results) {
        return results.map(r =>
            typeof r === 'string' ? r : (r.answer || r.text || r.content || JSON.stringify(r))
        );
    }

    // ─── Reset UI state ───────────────────────────────────────────────────────
    function resetState() {
        paginationDiv.style.display  = 'none';
        keywordDisplay.style.display = 'none';
        keywordChooser.style.display = 'none';
        subjectChooser.style.display = 'none';
        keywordChips.innerHTML       = '';
        subjectList.innerHTML        = '';
        searchResults = [];
        currentIndex  = 0;
    }

    // ─── Core search ──────────────────────────────────────────────────────────
    function doSearch(keyword) {
        subjectChooser.style.display = 'none';
        subjectList.innerHTML        = '';
        paginationDiv.style.display  = 'none';
        searchResults = [];
        currentIndex  = 0;

        keywordDisplay.style.display = 'block';
        keywordDisplay.innerText     = `🔍 Keyword: "${keyword}"`;
        resultDiv.innerText          = `ค้นหา: "${keyword}"...\n\nกำลังรอข้อมูล...`;

        const useNgrok = modeSelect.value === 'ngrok';

        chrome.runtime.sendMessage(
            { action: "fetchData", keyword: keyword, useNgrok: useNgrok },
            (res) => {
                if (chrome.runtime.lastError) {
                    resultDiv.innerText = "⚠️ Background script error:\n" + chrome.runtime.lastError.message;
                    return;
                }

                if (!res) {
                    resultDiv.innerText = "⚠️ ไม่ได้รับการตอบกลับจาก background script";
                    return;
                }

                if (res.success && res.data?.found && res.data.results?.length > 0) {
                    const rawResults = res.data.results;
                    const subjects = res.data.subjects || res.data.categories || null;
                    if (subjects && subjects.length > 1) {
                        subjectChooser.style.display = 'flex';
                        resultDiv.innerText = `🗂️ พบ ${subjects.length} วิชาที่เกี่ยวข้อง\nกรุณาเลือกวิชาที่ต้องการด้านบน`;

                        subjects.forEach((subj) => {
                            const name  = subj.name || subj;
                            const count = subj.count || '';
                            const btn   = document.createElement('button');
                            btn.className   = 'ds-subject-btn';
                            btn.innerHTML   = `📚 ${name} ${count ? `<span style="color:#aaa; font-size:11px;">(${count} ข้อ)</span>` : ''}`;
                            btn.addEventListener('click', () => {
                                subjectChooser.style.display = 'none';
                                let filtered = rawResults.filter(r =>
                                    (r.subject || r.category || '') === name
                                );
                                if (filtered.length === 0 && subj.start_index !== undefined) {
                                    filtered = rawResults.slice(subj.start_index, subj.start_index + (subj.count || rawResults.length));
                                }
                                if (filtered.length === 0) filtered = rawResults;
                                searchResults = flattenResults(filtered);
                                paginationDiv.style.display = 'flex';
                                updateDisplay();
                            });
                            subjectList.appendChild(btn);
                        });

                        document.getElementById('ds-subject-all-btn').onclick = () => {
                            subjectChooser.style.display = 'none';
                            searchResults = flattenResults(rawResults);
                            paginationDiv.style.display = 'flex';
                            updateDisplay();
                        };

                    } else {
                        searchResults = flattenResults(rawResults);
                        paginationDiv.style.display = 'flex';
                        updateDisplay();
                    }

                } else if (res.success === false) {
                    const isJsonErr = res.error && res.error.includes('JSON');
                    const hint = isJsonErr
                        ? '👉 Ngrok ส่ง HTML warning page กลับมา\n   แก้: เปิด ngrok URL ในเบราว์เซอร์ก่อน 1 ครั้ง\n   แล้วกด "Visit Site" จากนั้นลองใหม่'
                        : '👉 บอทรันอยู่ไหม?\n   ลองเปิด cmd แล้วรัน: python my_bot.py';
                    resultDiv.innerText = `⚠️ เชื่อมต่อไม่สำเร็จ\n${res.error}\n\n${hint}`;
                } else {
                    resultDiv.innerText = "❓ ไม่พบเฉลยในเซิร์ฟเวอร์\n(ลองเช็คการเว้นวรรคหรือ keyword)";
                }
            }
        );
    }

    // ─── AUTO: Extract keywords from page ────────────────────────────────────
    document.getElementById('ds-search-btn').addEventListener('click', () => {
        resetState();
        resultDiv.innerText = "🔎 กำลังวิเคราะห์โจทย์...";

        let textKeyword  = '';
        let imageKeyword = '';

        const textSelectors = [
            '.col-md-10.col-sm-10.col-xs-12',
            '.exam-sarabun.exam-question',
            '.question-text',
            '.question-content'
        ];
        let questionEl = null;
        for (const sel of textSelectors) {
            questionEl = document.querySelector(sel);
            if (questionEl) break;
        }

        if (questionEl) {
            let html = questionEl.innerHTML
                .replace(/<p[^>]*>/gi, '')
                .replace(/<\/p>/gi, '<br>');
            const parts = html.split(/<br\s*\/?>/i);
            for (const part of parts) {
                const tmp  = document.createElement('div');
                tmp.innerHTML = part;
                const text = tmp.innerText.trim();
                if (text.length > 2) {
                    textKeyword = text;
                    break;
                }
            }
            if (textKeyword) {
                textKeyword = textKeyword
                    .replace(/^ข้อ\s*\d+\.?\s*/, '')
                    .replace(/^\d+\.\s*/, '')
                    .trim()
                    .substring(0, 40)
                    .trim();
            }
        }

        const imgEl = document.querySelector(
            'img[src*="/question_pic/"], .col-md-10.col-sm-10.col-xs-12 img, .exam-question img'
        );
        if (imgEl && imgEl.src) {
            const m = imgEl.src.match(/\/([A-Za-z0-9_]+)\.(jpg|jpeg|png|gif)/i);
            if (m && m[1]) imageKeyword = m[1];
        }

        if (textKeyword && imageKeyword) {
            keywordChooser.style.display = 'flex';
            resultDiv.innerText = '📌 พบทั้งข้อความและรูปภาพ\nกรุณาเลือก keyword ที่ต้องการค้นหา';

            [
                { label: `📝 ข้อความ: "${textKeyword.substring(0,26)}${textKeyword.length>26?'…':''}"`, value: textKeyword },
                { label: `🖼️ รูปภาพ: "${imageKeyword}"`,                                               value: imageKeyword },
            ].forEach(opt => {
                const chip = document.createElement('button');
                chip.className   = 'ds-chip';
                chip.textContent = opt.label;
                chip.addEventListener('click', () => {
                    document.querySelectorAll('.ds-chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    keywordChooser.style.display = 'none';
                    doSearch(opt.value);
                });
                keywordChips.appendChild(chip);
            });
            return;
        }

        const keyword = textKeyword || imageKeyword;
        if (!keyword) {
            resultDiv.innerText = "❌ ไม่พบข้อความหรือรูปภาพโจทย์บนหน้านี้";
            return;
        }
        doSearch(keyword);
    });

    // ─── MANUAL search ────────────────────────────────────────────────────────
    document.getElementById('ds-manual-btn').addEventListener('click', () => {
        const raw = manualInput.value.trim();
        if (!raw) {
            resultDiv.innerText = "❌ กรุณาพิมพ์ keyword ก่อนค้นหา";
            return;
        }
        // Extract keyword: if it's an image URL, pull the filename ID; otherwise use as-is
        const kw = extractKeyword(raw);
        resetState();
        doSearch(kw);
    });

    manualInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('ds-manual-btn').click();
    });
}