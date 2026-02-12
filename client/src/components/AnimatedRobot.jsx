import React from 'react';

const AnimatedRobot = ({ className = "w-10 h-10", isThinking = false }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${className} overflow-visible`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Glow Effect behind head */}
            <circle cx="50" cy="50" r="40" fill="#4ade80" filter="blur(10px)" opacity="0.2" className="animate-pulse" />

            {/* Floating Group */}
            <g className="animate-robot-float origin-center">

                {/* Antenna */}
                <g className="animate-robot-antenna origin-bottom" style={{ transformOrigin: '50% 25%' }}>
                    <line x1="50" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="8" r="5" fill="#ef4444" className={isThinking ? "animate-ping" : ""} />
                    <circle cx="50" cy="8" r="5" fill="#ef4444" />
                </g>

                {/* Head */}
                <rect x="20" y="25" width="60" height="50" rx="12" fill="currentColor" />

                {/* Face Screen */}
                <rect x="28" y="35" width="44" height="26" rx="6" fill="#1e293b" />

                {/* Eyes Group */}
                <g className="animate-robot-blink origin-center" style={{ transformOrigin: '50% 48%' }}>
                    {isThinking ? (
                        // Thinking Eyes (bouncing dots)
                        <g fill="#4ade80">
                            <circle cx="38" cy="48" r="3">
                                <animate attributeName="cy" values="48;44;48" dur="0.6s" repeatCount="indefinite" begin="0s" />
                            </circle>
                            <circle cx="50" cy="48" r="3">
                                <animate attributeName="cy" values="48;44;48" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
                            </circle>
                            <circle cx="62" cy="48" r="3">
                                <animate attributeName="cy" values="48;44;48" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
                            </circle>
                        </g>
                    ) : (
                        // Normal Eyes
                        <>
                            <circle cx="40" cy="48" r="4" fill="#4ade80" />
                            <circle cx="60" cy="48" r="4" fill="#4ade80" />
                        </>
                    )}
                </g>

                {/* Mouth (Smile) */}
                {!isThinking && (
                    <path d="M42 56 Q50 62 58 56" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                )}

                {/* Ears/Headphones */}
                <rect x="14" y="40" width="6" height="20" rx="2" fill="#64748b" />
                <rect x="80" y="40" width="6" height="20" rx="2" fill="#64748b" />
            </g>
        </svg>
    );
};

export default AnimatedRobot;
