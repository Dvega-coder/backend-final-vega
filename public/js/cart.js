// --- public/js/cart.js ---

// Obtener ID del carrito desde la URL de forma segura
let path = window.location.pathname.split("/").filter(Boolean);
const cartId = path[path.length - 1];

// 🟢 Actualizar cantidad
document.querySelectorAll(".update-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const productId = row.dataset.id;
    const qty = Number(row.querySelector(".quantity-input").value);

    if (!Number.isInteger(qty) || qty < 1) {
      return alert("⚠️ La cantidad debe ser un número mayor o igual a 1.");
    }

    try {
      const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      alert("✅ Cantidad actualizada correctamente.");
      location.reload();
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("❌ No se pudo actualizar la cantidad.");
    }
  });
});

// 🔴 Eliminar producto individual
document.querySelectorAll(".remove-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const productId = row.dataset.id;

    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      alert("🗑️ Producto eliminado del carrito.");
      location.reload();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("❌ No se pudo eliminar el producto.");
    }
  });
});

// ⚫ Vaciar carrito
document.getElementById("clearCart")?.addEventListener("click", async () => {
  if (!confirm("¿Seguro que querés vaciar el carrito completo?")) return;

  try {
    const res = await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);
    alert("🧹 Carrito vaciado correctamente.");
    location.reload();
  } catch (err) {
    console.error("Error al vaciar carrito:", err);
    alert("❌ No se pudo vaciar el carrito.");
  }
});
