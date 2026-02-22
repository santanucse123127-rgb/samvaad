const Avatar = ({ src, name, size = 10, online = false, className = "" }) => (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
        <div className="sv-avatar w-full h-full text-base font-bold rounded-full overflow-hidden flex items-center justify-center bg-white/5">
            {src
                ? <img src={src} alt={name} className="w-full h-full object-cover" />
                : <span className="flex items-center justify-center w-full h-full" style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.3), hsl(var(--sv-accent-2)/0.3))' }}>
                    {name?.[0]?.toUpperCase()}
                </span>
            }
        </div>
        {online && <span className="sv-online-dot" />}
    </div>
);

export default Avatar;
