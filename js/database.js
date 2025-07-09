// URL TIDAK PERLU DIUBAH KARENA BACKEND TIDAK BERUBAH
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwKsyNaq7Lga6CroUAvWYhs56xuByM-xBksSZulqFtzrrqcLEug32e6JNvJgHyCbbUZIA/exec";

document.addEventListener("DOMContentLoaded", () => {
  // --- Referensi Elemen DOM ---
  const messageForm = document.getElementById("message-form");
  const chatBox = document.getElementById("chat-box");
  const usernameInput = document.getElementById("username-input");
  const messageInput = document.getElementById("message-input");
  const editorToolbar = document.querySelector(".editor-toolbar");

  // --- Fungsi Parser BBCode ke HTML ---
  function parseContent(text) {
    let html = text;

    // Fungsi untuk escape HTML agar aman ditampilkan
    const escapeHTML = (str) =>
      str.replace(
        /[&<>"']/g,
        (match) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[match])
      );

    // [b]Bold[/b]
    html = html.replace(/\[b\](.*?)\[\/b\]/gs, "<strong>$1</strong>");
    // [i]Italic[/i]
    html = html.replace(/\[i\](.*?)\[\/i\]/gs, "<em>$1</em>");
    // [quote]Quote[/quote]
    html = html.replace(
      /\[quote\](.*?)\[\/quote\]/gs,
      "<blockquote>$1</blockquote>"
    );
    // [spoiler]Spoiler[/spoiler]
    html = html.replace(
      /\[spoiler\](.*?)\[\/spoiler\]/gs,
      '<span class="spoiler" onclick="this.classList.add(\'revealed\')" title="Klik untuk melihat">$1</span>'
    );
    // [code]Code[/code]
    html = html.replace(/\[code\](.*?)\[\/code\]/gs, (match, code) => {
      return `<div class="code-block"><button class="copy-btn">Salin</button><pre>${escapeHTML(
        code
      )}</pre></div>`;
    });
    // [link=URL]Text[/link]
    html = html.replace(
      /\[link=(.*?)\](.*?)\[\/link\]/gs,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
    );
    // [img]URL[/img]
    html = html.replace(
      /\[img\](.*?)\[\/img\]/gs,
      '<img src="$1" alt="Gambar dari pengguna" class="user-image" onerror="this.style.display=\'none\'">'
    );
    // [video]URL[/video]
    html = html.replace(/\[video\](.*?)\[\/video\]/gs, (match, url) => {
      // YouTube
      let youtubeMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
      );
      if (youtubeMatch) {
        return `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
      }
      // Jika bukan YouTube, coba tampilkan sebagai link biasa
      return `<a href="${url}" target="_blank">${url}</a>`;
    });

    // Ganti baris baru dengan tag <br>
    html = html.replace(/\n/g, "<br>");

    return html;
  }

  // --- Fungsi untuk mengambil dan menampilkan pesan ---
  async function fetchMessages() {
    // ... (Fungsi ini hampir sama, hanya bagian innerHTML yang diubah)
    // ...
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        chatBox.innerHTML = "";
        if (result.data.length === 0) {
          chatBox.innerHTML =
            '<p class="loading-message">Belum ada balasan.</p>';
        } else {
          result.data.reverse().forEach((msg) => {
            const postElement = document.createElement("div");
            postElement.className = "post";
            // Menggunakan PARSER BARU di sini!
            postElement.innerHTML = `
                            <div class="post-author-info">
                                <img src="https://placehold.co/60x60/3A3B3C/E4E6EB?text=${encodeURIComponent(
                                  msg.username.charAt(0)
                                )}" alt="Avatar" class="avatar">
                                <div><div class="author-name">${escapeHTML(
                                  msg.username
                                )}</div></div>
                            </div>
                            <div class="post-content">
                                <div class="post-meta">Diposting pada ${new Date(
                                  msg.timestamp
                                ).toLocaleString("id-ID")}</div>
                                <div class="post-body">${parseContent(
                                  msg.message
                                )}</div>
                            </div>
                        `;
            chatBox.appendChild(postElement);
          });
        }
      } else {
        throw new Error(result.message || "Format data salah.");
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
      chatBox.innerHTML = `<p class="loading-message">Gagal memuat pesan. Error: ${error.message}.</p>`;
    }
  }

  // --- Logika untuk Toolbar Editor ---
  if (editorToolbar) {
    editorToolbar.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      const tag = target.dataset.tag;
      const id = target.id;

      // Fungsi untuk membungkus teks yang dipilih
      const wrapText = (openTag, closeTag) => {
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const selectedText = messageInput.value.substring(start, end);
        const newText = `${openTag}${selectedText}${closeTag}`;
        messageInput.value =
          messageInput.value.substring(0, start) +
          newText +
          messageInput.value.substring(end);
        messageInput.focus();
      };

      if (tag) {
        wrapText(`[${tag}]`, `[/${tag}]`);
      } else if (id === "add-link") {
        const url = prompt("Masukkan URL link:");
        if (url) wrapText(`[link=${url}]`, "[/link]");
      } else if (id === "add-image") {
        const url = prompt("Masukkan URL gambar/GIF:");
        if (url) messageInput.value += `\n[img]${url}[/img]`;
      } else if (id === "add-video") {
        const url = prompt("Masukkan URL video (misal: YouTube):");
        if (url) messageInput.value += `\n[video]${url}[/video]`;
      }
    });
  }

  // --- Logika untuk menyalin kode ---
  if (chatBox) {
    chatBox.addEventListener("click", (e) => {
      if (e.target.classList.contains("copy-btn")) {
        const codeBlock = e.target.nextElementSibling;
        navigator.clipboard
          .writeText(codeBlock.textContent)
          .then(() => {
            e.target.textContent = "Disalin!";
            setTimeout(() => {
              e.target.textContent = "Salin";
            }, 2000);
          })
          .catch((err) => console.error("Gagal menyalin:", err));
      }
    });
  }

  // --- Event Listener untuk Form Submit ---
  if (messageForm) {
    messageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const button = e.target.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "Mengirim...";

      const payload = {
        action: "sendMessage",
        username: usernameInput.value,
        message: messageInput.value,
      };

      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
        messageInput.value = "";
        setTimeout(fetchMessages, 1500);
      } catch (error) {
        console.error("Gagal mengirim pesan:", error);
      } finally {
        button.disabled = false;
        button.textContent = "Kirim Pesan";
      }
    });
  }

  // Panggil fetchMessages saat view diubah ke thread-view
  // ... (Logika navigasi ini tetap sama seperti di file main.js Anda)
});
