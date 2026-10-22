const S = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const make = (d) => (p) => <svg {...S} {...p}>{d}</svg>;
const teeth = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
  <rect key={a} x="10.6" y="1.8" width="2.8" height="3.6" rx="1" fill="currentColor" stroke="none" transform={`rotate(${a} 12 12)`} />
));

export const I = {
  Dashboard: make(<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />),
  Subjects: make(<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11" />),
  Schedule: make(<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>),
  Calendar: make(<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M8 14h2M14 14h2M8 17h2M14 17h2" /></>),
  Tasks: make(<path d="M9 6h11M9 12h11M9 18h11M4 6l1.2 1.2L7 5M4 12l1.2 1.2L7 11M4 18l1.2 1.2L7 17" />),
  History: make(<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>),
  Insights: make(<path d="M5 19V11M12 19V5M19 19v-6" />),
  Profile: make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  Settings: make(<><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" />{teeth}</>),
  Plus: make(<path d="M12 5v14M5 12h14" />),
  Bell: make(<path d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20h4" />),
  Search: make(<><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2" /></>),
  More: make(<><circle cx="12" cy="12" r="9" /><circle cx="8" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="16" cy="12" r="1" /></>),
  Chevron: make(<path d="M6 9l6 6 6-6" />),
  Arrow: make(<path d="M5 12h14M13 6l6 6-6 6" />),
};
