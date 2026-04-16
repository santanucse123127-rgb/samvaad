/**
 * ResponsiveViews.jsx
 * ─────────────────────────────────────────────────────────────────
 * Drop-in wrappers that automatically serve the correct UI based on
 * screen size.  Desktop views are completely unchanged.
 *
 * SETUP (3 steps):
 *
 *  1. Copy these 4 files into your project:
 *       src/hooks/useMediaQuery.js       ← the hook
 *       src/pages/MobileWelcome.jsx
 *       src/pages/MobileLogin.jsx
 *       src/pages/MobileRegister.jsx
 *
 *  2. Replace your router entries for /login and /register with the
 *     responsive wrappers exported from this file:
 *
 *       import {
 *         ResponsiveWelcome,
 *         ResponsiveLogin,
 *         ResponsiveRegister
 *       } from "@/pages/ResponsiveViews";
 *
 *       // In your router:
 *       <Route path="/"        element={<ResponsiveWelcome />} />
 *       <Route path="/login"   element={<ResponsiveLogin />} />
 *       <Route path="/register" element={<ResponsiveRegister />} />
 *
 *  3. Done! Desktop users see the existing Login/Register.
 *     Mobile users see the new MobileWelcome/MobileLogin/MobileRegister.
 *
 * ─────────────────────────────────────────────────────────────────
 * NOTE: The desktop Login and Register components are imported as-is
 * and are NOT modified in any way.
 * ─────────────────────────────────────────────────────────────────
 */

import { useIsMobile } from "@/hooks/useMediaQuery";

// ── Existing desktop views (unchanged) ──────────────────────────
import Login    from "@/pages/Login";
import Register from "@/pages/Register";
import AuthDesktop from "@/pages/AuthDesktop";

// ── New mobile views ─────────────────────────────────────────────
import MobileWelcome  from "@/pages/MobileWelcome";
import MobileAuthFlow from "@/pages/MobileAuthFlow";

/**
 * ResponsiveWelcome
 * Mobile  → splashscreen with orbs + "Sign in / Sign up" buttons
 * Desktop → redirects straight to /login  (adjust as needed)
 */
export const ResponsiveWelcome = () => {
  const isMobile = useIsMobile();
  // On desktop there is no dedicated welcome screen in the original app,
  // so we simply render the Login page.
  return isMobile ? <MobileWelcome /> : <AuthDesktop initialMode="login" />;
};

/**
 * ResponsiveLogin
 * Mobile  → MobileAuthFlow  (white card over image bg)
 * Desktop → existing Login (unchanged)
 */
export const ResponsiveLogin = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileAuthFlow initialMode="login" /> : <AuthDesktop initialMode="login" />;
};

/**
 * ResponsiveRegister
 * Mobile  → MobileAuthFlow  (white card over image bg)
 * Desktop → existing Register (unchanged)
 */
export const ResponsiveRegister = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileAuthFlow initialMode="register" /> : <AuthDesktop initialMode="register" />;
};