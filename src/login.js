const form = document.querySelector("#login-form");
const password = document.querySelector("#password");
const error = document.querySelector("#error");
const submit = document.querySelector("#submit");

form.addEventListener("submit", async event => {
  event.preventDefault();
  error.textContent = "";
  submit.disabled = true;
  submit.textContent = "확인 중…";
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: password.value }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "비밀번호를 확인해주세요.");
    const next = new URLSearchParams(location.search).get("next") || "/index.html";
    location.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/index.html");
  } catch (caught) {
    error.textContent = caught.message;
    password.select();
  } finally {
    submit.disabled = false;
    submit.textContent = "Start Today";
  }
});
