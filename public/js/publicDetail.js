
let CART_ID = localStorage.getItem("cartId");

// Crea un carrito si no existe
async function ensureCart() {
  if (!CART_ID) {
    const res = await fetch("/api/carts", { method: "POST" });
    const data = await res.json();
    if (data.status === "success") {
      CART_ID = data.payload._id;
      localStorage.setItem("cartId", CART_ID);
      console.log("🛒 Nuevo carrito creado:", CART_ID);
    } else {
      alert("❌ Error al crear carrito.");
    }
  }
}
ensureCart();

// Botón agregar al carrito
document.getElementById("addToCart")?.addEventListener("click", async (e) => {
  const pid = e.target.dataset.id;

  if (!CART_ID) {
    return alert("⚠️ No hay carrito activo. Recargá la página.");
  }

  try {
    const res = await fetch(`/api/carts/${CART_ID}/products/${pid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.status === "success") {
      alert("✅ Producto agregado al carrito correctamente");
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error de conexión con el servidor");
  }
});
