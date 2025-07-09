document.addEventListener("DOMContentLoaded", () => {
  // --- Dark Mode Logic ---
  const themeSwitch = document.getElementById("checkbox");

  // Fungsi ini akan dieksekusi di semua halaman yang memanggil script ini
  if (themeSwitch) {
    // Cek preferensi user dari localStorage
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      themeSwitch.checked = true;
    }

    themeSwitch.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark"); // Simpan preferensi
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light"); // Simpan preferensi
      }
    });
  }

  // --- View Navigation Logic (Hanya untuk index.html) ---
  // Cek apakah kita berada di halaman utama
  if (document.getElementById("category-view")) {
    const views = {
      "category-view": document.getElementById("category-view"),
      "topic-list-view": document.getElementById("topic-list-view"),
      "thread-view": document.getElementById("thread-view"),
    };

    const allNavLinks = document.querySelectorAll(".nav-link");

    function showView(targetId) {
      for (const id in views) {
        if (views[id]) views[id].style.display = "none";
      }
      if (views[targetId]) {
        views[targetId].style.display = "block";
        window.scrollTo(0, 0);
      }
    }

    allNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        let target = link.dataset.target;
        if (target) {
          showView(target);
        }
      });
    });

    // Inisialisasi: Tampilkan view kategori
    showView("category-view");
  }
});
