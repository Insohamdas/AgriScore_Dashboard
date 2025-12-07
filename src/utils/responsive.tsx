import React from 'react';

/**
 * Utility hook for responsive design
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState('lg');

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setScreenSize('sm');
      else if (window.innerWidth < 1024) setScreenSize('md');
      else setScreenSize('lg');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg'
  };
};

/**
 * Responsive container component
 */
export const ResponsiveContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`w-full px-4 sm:px-6 md:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Responsive grid component
 */
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: { sm?: number; md?: number; lg?: number };
}> = ({ children, cols = { sm: 1, md: 2, lg: 3 } }) => {
  const gridClass = `grid grid-cols-${cols.sm || 1} sm:grid-cols-${cols.md || 2} lg:grid-cols-${cols.lg || 3} gap-4`;
  return <div className={gridClass}>{children}</div>;
};

/**
 * Responsive typography component
 */
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'semibold' | 'bold';
  className?: string;
}> = ({ children, size = 'base', weight = 'normal', className = '' }) => {
  const sizeMap = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl'
  };

  const weightMap = {
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <p className={`${sizeMap[size]} ${weightMap[weight]} ${className}`}>
      {children}
    </p>
  );
};

/**
 * Mobile-first responsive layout
 */
export const ResponsiveLayout: React.FC<{
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ sidebar, main, header, footer }) => {
  const { isMobile } = useResponsive();

  return (
    <div className="flex flex-col min-h-screen">
      {header && <header className="sticky top-0 z-40 bg-white shadow-sm">{header}</header>}

      <div className="flex flex-1 overflow-hidden">
        {sidebar && !isMobile && (
          <aside className="hidden md:block w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto">
            {sidebar}
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <ResponsiveContainer>{main}</ResponsiveContainer>
        </main>
      </div>

      {footer && <footer className="bg-slate-50 border-t border-slate-200">{footer}</footer>}
    </div>
  );
};

/**
 * Responsive image component
 */
export const ResponsiveImage: React.FC<{
  src: string;
  alt: string;
  ratio?: 'square' | 'video' | 'thumbnail';
}> = ({ src, alt, ratio = 'video' }) => {
  const ratioMap = {
    square: 'aspect-square',
    video: 'aspect-video',
    thumbnail: 'aspect-[3/4]'
  };

  return (
    <div className={`${ratioMap[ratio]} bg-slate-200 rounded-lg overflow-hidden`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

/**
 * CSS media query constants for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
