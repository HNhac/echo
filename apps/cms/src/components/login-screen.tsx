import { IconSparkle } from "./icons";

type Props = {
  username: string;
  password: string;
  error: string;
  busy: boolean;
  onUsername: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function LoginScreen({
  username,
  password,
  error,
  busy,
  onUsername,
  onPassword,
  onSubmit,
}: Props) {
  return (
    <main className="login">
      <section className="login__story">
        <p className="eyebrow">
          ECHO <IconSparkle /> Studio
        </p>
        <h1>
          Quản trị
          <em> bộ sưu tập</em>
        </h1>
        <p className="login__lede">
          Đơn hàng, sản phẩm và lookbook của shop thời trang bé gái — một nơi, trên máy bạn.
        </p>
      </section>
      <section className="login__panel">
        <form className="login__card" onSubmit={onSubmit}>
          <p className="eyebrow">Đăng nhập</p>
          <h2>Vào studio</h2>
          <p className="muted">Mặc định: admin / echo-admin</p>
          <label className="field">
            <span>Tài khoản</span>
            <input
              value={username}
              onChange={(e) => onUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="alert">{error}</p> : null}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Đang vào…" : "Vào quản trị"}
          </button>
        </form>
      </section>
    </main>
  );
}
