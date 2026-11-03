export default function SpiderWallpaper() {
  return (
    <>
      <style>{`
        .spider-wallpaper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 30%, transparent 58%),
            linear-gradient(180deg, rgba(15, 17, 26, 0.18), rgba(0, 0, 0, 0.38));
        }
        .spider-web {
          position: absolute;
          inset: -15% -10% -10% -10%;
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.02) 30%, transparent 30.5%),
            repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0 1px, transparent 1px 25px),
            linear-gradient(135deg, rgba(255,255,255,0.18), transparent 40%, rgba(255,255,255,0.08));
          filter: blur(0.5px);
          transform: scale(1.2);
          animation: spiderDrift 16s ease-in-out infinite alternate;
        }
        .spider-silhouette {
          position: absolute;
          right: 12%;
          bottom: 8%;
          width: 32vmin;
          height: 42vmin;
          border-radius: 42% 58% 50% 50% / 36% 42% 58% 64%;
          background: linear-gradient(180deg, rgba(15, 19, 28, 0.82), rgba(8, 9, 14, 0.96));
          box-shadow: inset 12px 14px 20px rgba(255,255,255,0.12), inset -14px -12px 22px rgba(0,0,0,0.32);
          opacity: 0.8;
          transform: rotate(-22deg);
          animation: spiderFloat 10s ease-in-out infinite alternate;
        }
        .spider-silhouette::before,
        .spider-silhouette::after {
          content: "";
          position: absolute;
          inset: 18% 22% auto auto;
          width: 28%;
          height: 22%;
          border-radius: 50%;
          background: rgba(255,255,255,0.10);
          box-shadow: -28px 18px 0 rgba(255,255,255,0.12), -60px 42px 0 rgba(255,255,255,0.09);
        }
        .spider-silhouette::after {
          inset: auto auto 10% 14%;
          width: 22%;
          height: 18%;
          border-radius: 50%;
          background: rgba(10, 12, 18, 0.75);
        }
        @keyframes spiderDrift {
          0% { transform: scale(1.2) rotate(-3deg) translate3d(0, 0, 0); }
          100% { transform: scale(1.35) rotate(3deg) translate3d(4%, -2%, 0); }
        }
        @keyframes spiderFloat {
          0% { transform: rotate(-24deg) translate3d(0, 0, 0); }
          100% { transform: rotate(-18deg) translate3d(-2%, -2%, 0); }
        }
      `}</style>
      <div className="spider-wallpaper" aria-hidden="true">
        <div className="spider-web" />
        <div className="spider-silhouette" />
      </div>
    </>
  );
}
