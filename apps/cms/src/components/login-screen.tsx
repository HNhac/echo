"use client";

import { useState } from "react";
import { LoginParticles } from "./login-particles";
import { ThemeToggle } from "./theme-toggle";
import { BrandLogo } from "./brand-logo";
import { IconArrow, IconEye, IconEyeOff, IconLock, IconUser } from "./icons";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="login">
      <div className="login__scene" aria-hidden>
        <div className="login__wash" />
        <div className="login__orb login__orb--a" />
        <div className="login__orb login__orb--b" />
        <div className="login__orb login__orb--c" />
        <div className="login__grid" />
      </div>
      <LoginParticles />
      <div className="login__veil" aria-hidden />

      <section className="login__card">
        <ThemeToggle />
        <header className="login__brand">
          <BrandLogo className="login__logo" size={72} />
          <p className="login__wordmark">
            ECHO<span>Studio</span>
          </p>
          <h1>Đăng nhập</h1>
        </header>
        <form className="login__form" onSubmit={onSubmit}>
          <label className="login__field" htmlFor="cms-username">
            Tài khoản
            <span className="login__box">
              <span className="login__icon">
                <IconUser />
              </span>
              <input
                id="cms-username"
                value={username}
                onChange={(e) => onUsername(e.target.value)}
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </span>
          </label>
          <label className="login__field" htmlFor="cms-password">
            Mật khẩu
            <span className="login__box">
              <span className="login__icon">
                <IconLock />
              </span>
              <input
                id="cms-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className="login__reveal"
                onClick={() => setShowPassword((open) => !open)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </span>
          </label>
          {error ? <p className="alert">{error}</p> : null}
          <button className="login__submit" type="submit" disabled={busy}>
            {busy ? "Đang vào…" : "Đăng nhập"}
            {busy ? null : <IconArrow />}
          </button>
        </form>
      </section>
    </main>
  );
}
