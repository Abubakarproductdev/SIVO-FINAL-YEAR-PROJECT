// =============================================
// DEEP SPACE COLOR PALETTE
// =============================================
const COLORS = {
  bgDark: '#000000', // Solid black
  bgCard: '#0a0a0a', // Base for glassmorphism
  bgElevated: 'rgba(255, 255, 255, 0.05)', // Slightly raised glass
  bgInput: '#111111',
  
  // Gradients will use array of colors or we define start/end
  primary: '#7c3aed', // Primary gradient start (violet)
  primaryEnd: '#06b6d4', // Primary gradient end (cyan)
  
  accent: '#f43f5e', // Accent gradient start (rose)
  accentEnd: '#fb923c', // Accent gradient end (orange)
  
  coral: '#f43f5e', // Mapped to the new accent start
  violet: '#7c3aed', // Mapped to primary start
  
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0', // Light gray
  textMuted: '#94A3B8', // Medium gray
  
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  
  success: '#22D3EE', // Cyan-ish for success
  error: '#f43f5e',
  warning: '#fb923c',
};

export default COLORS;
