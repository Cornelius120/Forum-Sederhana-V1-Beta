// Ganti dengan URL Web App Anda yang sudah benar-benar di-deploy
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfkMMCOX2n-gHj1hnrBNuEEM-4Z_64EVyqVdPsUoTNKI8jhUYKB1fgwAeXaiCqc62QCw/exec";

document.addEventListener("DOMContentLoaded", () => {
  const messageForm = document.getElementById("message-form");
  const chatBox = document.getElementById("chat-box");
  const usernameInput = document.getElementById("username-input");
  const messageInput = document.getElementById("message-input");

  // Fungsi untuk mengambil dan menampilkan semua pesan
  async function fetchMessages() {
    // --- DEBUG --- Mencetak status ke console browser
    console.log("Mencoba mengambil pesan dari server...");
    if (!chatBox) return; // Hentikan jika chatbox tidak ditemukan

    chatBox.innerHTML = '<p class="loading-message">Memuat pesan...</p>';

    try {
      const response = await fetch(SCRIPT_URL);

      // --- DEBUG --- Cek response mentah dari server
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // --- DEBUG --- Tampilkan data yang diterima di console
      console.log("Data diterima dari server:", result);

      if (result.status === "success" && Array.isArray(result.data)) {
        chatBox.innerHTML = ""; // Kosongkan box
        if (result.data.length === 0) {
          chatBox.innerHTML =
            '<p class="loading-message">Belum ada balasan. Jadilah yang pertama!</p>';
        } else {
          // Urutkan pesan dari yang terbaru ke yang terlama
          result.data.reverse().forEach((msg) => {
            // Pastikan data baris tidak kosong
            if (msg.username && msg.message) {
              const postElement = document.createElement("div");
              postElement.className = "post"; // Menggunakan style .post yang sudah ada
              postElement.innerHTML = `
                                <div class="post-author-info">
                                    <img src="https://placehold.co/60x60/3A3B3C/E4E6EB?text=${encodeURIComponent(
                                      msg.username.charAt(0)
                                    )}" alt="Avatar" class="avatar">
                                    <div>
                                        <div class="author-name">${escapeHTML(
                                          msg.username
                                        )}</div>
                                    </div>
                                </div>
                                <div class="post-content">
                                    <div class="post-meta">Diposting pada ${new Date(
                                      msg.timestamp
                                    ).toLocaleString("id-ID")}</div>
                                    <div class="post-body">
                                        <p>${escapeHTML(msg.message)}</p>
                                    </div>
                                </div>
                            `;
              chatBox.appendChild(postElement);
            }
          });
        }
      } else {
        throw new Error(result.message || "Format data dari server salah.");
      }
    } catch (error) {
      // --- DEBUG --- Tampilkan error di console dan di halaman
      console.error("Gagal memuat pesan:", error);
      chatBox.innerHTML = `<p class="loading-message">Gagal memuat pesan. Error: ${error.message}. Cek console untuk detail.</p>`;
    }
  }

  // Fungsi untuk mengirim pesan baru
  async function postMessage(e) {
    e.preventDefault();
    const button = e.target.querySelector("button");
    button.disabled = true;
    button.textContent = "Mengirim...";

    const payload = {
      username: usernameInput.value,
      message: messageInput.value,
    };

    try {
      console.log("Mengirim pesan:", payload);
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Coba tambahkan ini untuk beberapa kasus
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Ubah header untuk menghindari preflight
      });

      console.log("Pesan terkirim, menunggu untuk refresh...");

      // Beri jeda sedikit agar Google Sheet sempat update
      setTimeout(() => {
        usernameInput.value = ""; // Kosongkan nama setelah berhasil
        messageInput.value = "";
        fetchMessages();
      }, 1500);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      alert("Gagal mengirim pesan: " + error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Kirim Pesan";
    }
  }

  // Fungsi untuk mencegah XSS (Cross-Site Scripting) dengan mengubah karakter spesial
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[match];
    });
  }

  if (messageForm) {
    messageForm.addEventListener("submit", postMessage);
  }

  // Panggil fetchMessages hanya jika kita berada di halaman thread
  const threadView = document.getElementById("thread-view");
  if (threadView && threadView.style.display !== "none") {
    fetchMessages();
  }

  // Kita juga perlu memanggil fetchMessages saat view diubah
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.currentTarget.dataset.target === "thread-view") {
        // Beri jeda sedikit agar elemennya muncul di DOM
        setTimeout(fetchMessages, 100);
      }
    });
  });
});
