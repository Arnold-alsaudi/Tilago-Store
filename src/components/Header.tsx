'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

export function Header() {
  const { data: session } = useSession();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <header id="header" dir="ltr" className={scrolled ? 'scrolled' : ''}>
        {/* Logo */}
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images.png" alt="Tilago Logo" className="logo-img" />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className="fas fa-bars" />
        </button>

        {/* Nav */}
        <nav>
          <ul className={menuOpen ? 'mobile-open' : ''}>
            <li><Link href="/">Home</Link></li>
            <li>
              <a href="#">Page <i className="fas fa-chevron-down" /></a>
              <div className="dropdown-content">
                <Link href="/alerts"><i className="fas fa-bell" /> Alerts</Link>
                <Link href="/stream"><i className="fas fa-video" /> Stream</Link>
                <Link href="/videos"><i className="fas fa-play-circle" /> Videos</Link>
                <Link href="/3d"><i className="fa-solid fa-cube" /> 3D</Link>
                <Link href="/contact"><i className="fa fa-code" /> Developer</Link>
              </div>
            </li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/#about">About</Link></li>
            <li><Link href="/3d">3D Model</Link></li>
          </ul>
        </nav>

        {/* Icons */}
        <div className="icons">
          <a href="#"><i className="fab fa-tiktok" /></a>
          <a href="#"><i className="fab fa-instagram" /></a>

          {/* Cart */}
          <Link href="/cart" style={{ position: 'relative', color: '#c4a0e0', fontSize: '1.4rem', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(15,8,59,0.6)', border: '1px solid rgba(84,22,181,0.4)' }}>
            <i className="fas fa-shopping-cart" />
            {count > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#5416B5', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {session ? (
            <button className="login-btn" onClick={() => signOut()}>Logout</button>
          ) : (
            <Link href="/auth/signin" className="login-btn" style={{ textDecoration: 'none' }}>Login</Link>
          )}
        </div>
      </header>

      <style>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(12, 5, 22, 0.97);
          padding: 20px 50px;
          border-bottom: 1px solid rgba(84, 22, 181, 0.5);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }
        header.scrolled {
          padding: 14px 50px;
          background: rgba(12, 5, 22, 0.99);
          border-bottom: 1px solid rgba(127, 58, 161, 0.6);
        }
        .logo-img {
          height: 55px;
          width: auto;
          object-fit: contain;
          cursor: pointer;
          mix-blend-mode: screen;
          image-rendering: -webkit-optimize-contrast;
        }
        header nav ul {
          list-style: none;
          display: flex;
          gap: 35px;
          align-items: center;
          margin: 0; padding: 0;
        }
        header nav ul li {
          position: relative;
        }
        header nav ul li a {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.85);
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          position: relative;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 4px;
        }
        header nav ul li a::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0%; height: 2px;
          background: linear-gradient(90deg, #5416B5, #7F3AA1);
          transition: width 0.3s ease;
        }
        header nav ul li a:hover::after { width: 100%; }
        header nav ul li a:hover { color: #c4a0e0; }
        .dropdown-content {
          position: absolute;
          top: 100%; left: 0;
          background: rgba(12, 5, 22, 0.99);
          border: 1px solid rgba(84, 22, 181, 0.4);
          border-radius: 12px;
          padding: 8px 0;
          display: none;
          flex-direction: column;
          min-width: 210px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
          animation: fadeInDrop 0.25s ease;
          overflow: hidden;
          margin-top: 10px;
        }
        .dropdown-content::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #5416B5, #7F3AA1);
        }
        header nav ul li:hover .dropdown-content { display: flex; }
        .dropdown-content a {
          padding: 11px 22px !important;
          color: rgba(255, 255, 255, 0.8) !important;
          text-decoration: none;
          font-size: 0.95rem !important;
          transition: all 0.25s !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          margin: 3px 10px;
          border-radius: 8px;
        }
        .dropdown-content a::after { display: none !important; }
        .dropdown-content a:hover {
          color: #c4a0e0 !important;
          background: rgba(84, 22, 181, 0.2);
          transform: translateX(4px);
        }
        @keyframes fadeInDrop {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .icons {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .icons > a {
          color: #c4a0e0;
          font-size: 1.3rem;
          transition: all 0.3s;
          position: relative;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(15, 8, 59, 0.6);
          border: 1px solid rgba(84, 22, 181, 0.4);
          text-decoration: none;
        }
        .icons > a:hover {
          color: #fff;
          transform: translateY(-3px);
          background: rgba(84, 22, 181, 0.3);
          border-color: #7F3AA1;
        }
        .login-btn {
          background: linear-gradient(135deg, #5416B5, #7F3AA1);
          border: none;
          padding: 11px 26px;
          border-radius: 25px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(84, 22, 181, 0.4);
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 22px rgba(84, 22, 181, 0.55);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #c4a0e0;
          font-size: 1.5rem;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          header { padding: 15px 30px; }
          header nav ul { gap: 25px; }
        }
        @media (max-width: 768px) {
          header { padding: 15px 20px; }
          header nav ul { gap: 15px; font-size: 0.9rem; }
          header nav ul li a { padding: 6px 0; font-size: 0.9rem; }
          .icons { gap: 14px; }
          .login-btn { padding: 8px 18px; font-size: 0.85rem; }
          .logo-img { height: 40px; }
        }
        @media (max-width: 480px) {
          header nav ul { display: none; }
          header nav ul.mobile-open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%; left: 0; right: 0;
            background: rgba(12, 5, 22, 0.99);
            padding: 20px;
            z-index: 999;
            border-bottom: 1px solid rgba(84, 22, 181, 0.4);
          }
          .mobile-menu-btn { display: block; }
          .logo-img { height: 35px; }
        }
      `}</style>
    </>
  );
}
