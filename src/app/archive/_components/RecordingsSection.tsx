"use client";
import React, { useState, useEffect } from 'react';

const YOUTUBE_API_KEY = "AIzaSyCLY3RWXne_458p9e6ZSBMTzFiJveQSn7Q";

const PLAYLIST_MAP: Record<string, string> = {
  balagha: "PLKU5sS798fPo",
  qiraah: "PLdnR_d9WNleo",
  tawheed: "PLPJw5eoRDYkw",
  kitaba: "PLGELkd3mgXnk",
  nahw: "PLe4mglMAFyMI",
  adab: "PLdJKXXyPk4G0",
  indonesian: "PLBh8NviWZoXw",
  pkn: "PLKDrouyi9c0I"
};

const SUBJECT_NAMES: Record<string, string> = {
  balagha: "البلاغة",
  qiraah: "القراءة",
  tawheed: "التوحيد",
  kitaba: "الكتابة",
  nahw: "النحو",
  adab: "تاريخ الأدب",
  indonesian: "اللغة الإندونيسية",
  pkn: "التربية الوطنية"
};

interface VideoItem {
  title: string;
  thumbnail: string;
  videoId: string;
}

export default function RecordingsSection() {
  const [activeSubject, setActiveSubject] = useState('tawheed');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      const playlistId = PLAYLIST_MAP[activeSubject];
      
      if (!playlistId || playlistId.length < 10 || playlistId.startsWith("PLAYLIST_ID")) {
        if (isMounted) { setVideos([]); setLoading(false); }
        return;
      }

      const endpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${YOUTUBE_API_KEY}`;
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (isMounted) { setVideos([]); setLoading(false); }
          return;
        }

        const data = await response.json();
        const items = data.items
          .filter((item: any) => item.snippet && item.snippet.title !== "Private video" && item.snippet.title !== "Deleted video")
          .map((item: any) => ({
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.maxres?.url ||
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.medium?.url ||
              '/assets/images/web/default_cover.png',
            videoId: item.snippet.resourceId.videoId
          }));

        if (isMounted) {
          setVideos(items);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load recordings:", error);
        if (isMounted) { setVideos([]); setLoading(false); }
      }
    };

    fetchVideos();
    setIsExpanded(false);
    return () => { isMounted = false; };
  }, [activeSubject]);

  const visibleVideos = isExpanded ? videos : videos.slice(0, 3);
  const subjectLabel = SUBJECT_NAMES[activeSubject] || "المقرر الدراسي";

  return (
    <section id="recordings" className="main-card-section">
      <div className="section-header">
        <h2 className="section-title">التسجيلات</h2>
        {videos.length > 3 && (
          <button 
            className="view-all-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "عرض أقل ←" : "← عرض الكل"}
          </button>
        )}
      </div>

      <div className="archive-filter-bar">
        <select className="level-select" defaultValue="1">
          <option value="1">المستوى الأول</option>
          <option value="2">المستوى الثاني</option>
        </select>
        <div className="category-buttons" style={{ marginBottom: 0 }}>
          {Object.entries(SUBJECT_NAMES).map(([key, label]) => (
            <button 
              key={key} 
              className={`cat-btn ${activeSubject === key ? 'active' : ''}`}
              onClick={() => setActiveSubject(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div id="recordingsContainer" className="recordings-grid">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="recording-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
              <div className="recording-thumb-wrapper skeleton-box" style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#cbd5e1' }}></div>
              <div className="recording-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
                <div className="skeleton-box" style={{ height: '16px', width: '80%' }}></div>
                <div className="skeleton-box" style={{ height: '12px', width: '60%' }}></div>
              </div>
            </div>
          ))
        ) : videos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', gridColumn: '1/-1' }}>لا توجد تسجيلات متاحة حالياً لهذا المقرَّر.</p>
        ) : (
          visibleVideos.map((video) => (
            <div key={video.videoId} className="recording-card" onClick={() => setPlayingVideo({ id: video.videoId, title: video.title })}>
              <div className="recording-thumb-wrapper">
                <img src={video.thumbnail.startsWith('/') || video.thumbnail.startsWith('http') ? video.thumbnail : `/${video.thumbnail}`} alt={video.title} className="recording-thumb" />
                <div className="play-icon-overlay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="recording-details">
                <h3>{video.title}</h3>
                <p>مادة {subjectLabel} - المستوى الأول</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {playingVideo && (
        <div className="video-modal-overlay show" onClick={() => setPlayingVideo(null)}>
          <div className="video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3 className="video-modal-title">{playingVideo.title}</h3>
              <button className="modal-close-x" onClick={() => setPlayingVideo(null)}>&times;</button>
            </div>
            <div className="video-wrapper">
              <iframe 
                src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1`}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
