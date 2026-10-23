import { useState } from "react";
import Modal from "./Modal";
import Radio from "./Radio";
import { useSync } from "./sync";
import { useT } from "./i18n";

export default function SyncDialog() {
  const t = useT();
  const s = useSync();
  const [pick, setPick] = useState("merge");
  if (!s.conflict) return null;
  return (
    <Modal top locked tone="info" icon="user" title={t("We found data in your account")}
      text={t("This device and your account both have data. What should we do?")}
      cancelLabel={null} confirmLabel={t("Continue")} onConfirm={() => s.conflict.resolve(pick)}>
      <div className="radios">
        <Radio name="sync" checked={pick === "merge"} label={t("Combine both")} onChange={() => setPick("merge")} />
        <Radio name="sync" checked={pick === "cloud"} label={t("Use my account's data")} onChange={() => setPick("cloud")} />
        <Radio name="sync" checked={pick === "device"} label={t("Keep this device's data")} onChange={() => setPick("device")} />
      </div>
    </Modal>
  );
}
