import { useState, useEffect } from "react";
import axios from "axios";

// ============================================
// AstroWax Panel V1.80 — Server Live Stats
// Glass + Purple Theme
// ============================================

export default function ServerLiveStats({ 
  serverId, 
  limitRam, 
  status 
}: { 
  serverId: string; 
  limitRam: number; 
  status: string;
}) {
  const [liveRam, setLiveRam] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'online') return;
    
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/servers/${serverId}/stats`);
        setLiveRam(res.data.ram); // RAM is in MB
      } catch (e) {}
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [serverId, status]);

  // Offline state
  if (status !== 'online') {
    return (
      <span 
        className="font-mono text-xs md:text-sm"
        style={{ color: 'rgba(168,85,247,.75)' }}
      >
        {limitRam}{" "}
        <span style={{ color: '#71717a', opacity: 0.7 }}>GB</span>
      </span>
    );
  }

  const liveRamGB = liveRam !== null ? (liveRam / 1024).toFixed(1) : "...";

  return (
    <span 
      className="font-mono text-xs md:text-sm flex items-center gap-1"
      style={{ color: 'rgba(168,85,247,.85)' }}
    >
      {/* Live indicator dot */}
      <span 
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background: '#a855f7',
          boxShadow: '0 0 6px rgba(168,85,247,.9)',
          animation: 'awLivePulse 2s ease-in-out infinite',
        }}
      />
      <span>{liveRamGB}</span>
      <span style={{ color: '#71717a', opacity: 0.8 }}>
        / {limitRam} GB
      </span>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.8); }
        }
      `}} />
    </span>
  );
}