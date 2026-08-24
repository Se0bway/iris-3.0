import { useState } from "react";
import { counselor } from "../data";
import { useNav } from "../nav";

export function LoginScreen() {
  const nav = useNav();
  const [no, setNo] = useState(counselor.no);
  const [pw, setPw] = useState("********");
  const [virtual, setVirtual] = useState(false);

  return (
    <div className="login">
      <div className="login-mark">IR</div>
      <h3>IRIS 3.0</h3>
      <p className="desc">
        뉴커머스 카운셀러를 위한 영업 운영 플랫폼입니다.
        고객관리가 아니라 발굴부터 수금까지 한 화면에서 이어집니다.
      </p>
      <div className="field">
        <label>카운셀러 번호</label>
        <input value={no} onChange={(e) => setNo(e.target.value)} />
      </div>
      <div className="field">
        <label>비밀번호</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, margin: "4px 0 18px" }}>
        <input type="checkbox" checked={virtual} onChange={(e) => setVirtual(e.target.checked)} />
        가상 계정 카운셀러 로그인
      </label>
      <button className="btn primary" type="button" onClick={() => nav.go("mfa")}>
        다음 · 멀티팩터 인증
      </button>
      <p className="foot">로컬 프로토타입 · 인증 없이 다음 단계로 이동합니다</p>
    </div>
  );
}

export function MfaScreen() {
  const nav = useNav();
  const [code, setCode] = useState(["1", "2", "3", "4", "5", "6"]);

  return (
    <div className="login">
      <button type="button" onClick={nav.back} style={{ alignSelf: "flex-start", border: 0, background: "none", padding: 0, color: "var(--muted)" }}>
        뒤로
      </button>
      <div className="login-mark">2F</div>
      <h3>인증 코드를 입력하세요</h3>
      <p className="desc">등록된 휴대폰으로 전송된 6자리 코드로 로그인합니다.</p>
      <div className="otp">
        {code.map((n, i) => (
          <input
            key={i}
            value={n}
            maxLength={1}
            onChange={(e) => {
              const next = [...code];
              next[i] = e.target.value.slice(-1);
              setCode(next);
            }}
          />
        ))}
      </div>
      <div className="notice" style={{ margin: "0 0 16px" }}>
        사업자등록 완료 계정 · 주문 · 판매 · 수금 · 입금조회 권한이 열립니다.
        미등록 계정은 조회 중심으로 권한이 제한됩니다.
      </div>
      <button className="btn primary" type="button" onClick={() => nav.go("home")}>
        로그인
      </button>
    </div>
  );
}
