import { useMemo, useState } from "react";
import { TODAY, counselor } from "../data";
import { useConsults } from "../consult";
import { useNav } from "../nav";
import type { Customer } from "../types";
import { TopBar } from "../ui";

const YEARS = Array.from({ length: 90 }, (_, i) => String(2026 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const MOBILE = ["010", "011", "016", "017", "018", "019"];
const TEL = ["선택", "02", "031", "032", "051", "053", "062", "064"];
const JOBS = ["선택", "주부", "직장인", "자영업", "전문직", "기타"];
const NOTICES = [
  "개인정보 수집·이용에 동의하지 않으면 애칭만으로 등록할 수 있습니다.",
  "애칭만으로 등록한 고객은 이후 일반고객·통합고객으로 전환할 수 없습니다.",
  "뷰티포인트 혜택을 받으려면 휴대폰 인증이 필요합니다.",
  "정보와 동의 항목은 고객이 직접 입력·확인해야 합니다.",
];

function splitPhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length >= 10) return { p1: d.slice(0, 3), p2: d.slice(3, 7), p3: d.slice(7, 11) };
  return { p1: "010", p2: "", p3: "" };
}

function Radio({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="reg-radios">
      {options.map((o) => (
        <button key={o} className={value === o ? "on" : ""} type="button" onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function RegisterScreen() {
  const nav = useNav();
  const { list, nextNo, addCustomer, addNote } = useConsults();
  const no = useMemo(nextNo, [list]);
  const draft = splitPhone(nav.draftPhone);
  const [tab, setTab] = useState<"req" | "opt">("req");
  const [consent, setConsent] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [name, setName] = useState(nav.draftName);
  const [nick, setNick] = useState("");
  const [p1, setP1] = useState(MOBILE.includes(draft.p1) ? draft.p1 : "010");
  const [p2, setP2] = useState(draft.p2);
  const [p3, setP3] = useState(draft.p3);
  const [cal, setCal] = useState("양력");
  const [yy, setYy] = useState("");
  const [mm, setMm] = useState("");
  const [dd, setDd] = useState("");
  const [gender, setGender] = useState("");
  const [mail, setMail] = useState("자택");
  const [homeZip1, setHomeZip1] = useState("");
  const [homeZip2, setHomeZip2] = useState("");
  const [home1, setHome1] = useState("");
  const [home2, setHome2] = useState("");
  const [workZip1, setWorkZip1] = useState("");
  const [workZip2, setWorkZip2] = useState("");
  const [work1, setWork1] = useState("");
  const [work2, setWork2] = useState("");
  const [job, setJob] = useState("선택");
  const [recruit, setRecruit] = useState("지인");
  const [wyy, setWyy] = useState("");
  const [wmm, setWmm] = useState("");
  const [wdd, setWdd] = useState("");
  const [t1, setT1] = useState("선택");
  const [t2, setT2] = useState("");
  const [t3, setT3] = useState("");
  const [emailOk, setEmailOk] = useState("아니오");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("선택안함");
  const [smsOk, setSmsOk] = useState("아니오");
  const [tmOk, setTmOk] = useState("아니오");
  const [dmOk, setDmOk] = useState("아니오");
  const [collSms, setCollSms] = useState("아니오");

  const phone = [p1, p2, p3].filter(Boolean).join("-");
  const birth = yy && mm && dd ? `${yy}-${mm}-${dd}` : "";
  const age = yy ? Math.max(0, 2026 - Number(yy)) : 0;
  const homeAddr = [home1, home2].filter(Boolean).join(" ");
  const workAddr = [work1, work2].filter(Boolean).join(" ");

  const save = () => {
    if (consent) {
      if (!name.trim() || p2.length < 3 || p3.length < 4) {
        nav.setToast("고객명과 휴대폰을 입력해 주세요");
        return;
      }
    } else if (!nick.trim()) {
      nav.setToast("동의하지 않으면 애칭으로만 등록할 수 있습니다");
      return;
    }

    const id = `c${no}`;
    const displayName = consent ? name.trim() : nick.trim();
    const row: Customer = {
      id,
      name: displayName,
      phone: consent ? phone : "",
      birth: birth || `${2026 - 40}-01-01`,
      age: age || 0,
      address: homeAddr || workAddr || "",
      joinedAt: TODAY,
      lastPurchaseAt: null,
      lastPurchaseDays: 0,
      expectedRepurchaseAt: null,
      expectedLabel: null,
      birthdayOffset: null,
      totalAmount: 0,
      purchaseCount: 0,
      avgAmount: 0,
      unpaid: 0,
      segments: ["new"],
      status: "new",
      tendency: "relationship",
      purchaseProb: "medium",
      churnRisk: "low",
      lastConsultAt: null,
      favoriteBrand: "",
      interestProducts: [],
      skin: "",
      family: nick.trim() || "없음",
      lifestyle: job === "선택" ? "" : job,
      purpose: "",
      habit: "",
      health: "",
      anniversaries: wyy && wmm && wdd ? [{ type: "결혼기념일", date: `${wyy}-${wmm}-${wdd}` }] : [],
      beautyPoints: 0,
      pointHistory: [],
      skinDiagnosis: "",
      timeline: [
        {
          id: `t-${id}`,
          date: TODAY,
          kind: "join",
          title: "가입",
          detail: `${recruit} · ${cal}`,
        },
      ],
      consults: [],
      ledger: [],
      aiHint: "",
      recommendedAction: "",
      customerType: consent ? "일반고객" : "닉네임고객",
      gender: gender === "남성" ? "m" : gender === "여성" ? "f" : undefined,
    };
    addCustomer(row);
    if (memo.trim()) addNote(id, "고객메모", memo.trim());
    nav.setToast("고객을 등록했습니다");
    nav.go("customer", { customerId: id });
  };

  return (
    <div className="reg-page">
      <TopBar title="고객등록" onBack={nav.back} />
      <div className="reg-scroll">
        <div className="reg-notice">
          {NOTICES.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <div className="reg-consent">
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            개인정보 수집 및 이용동의
          </label>
          <button type="button" onClick={() => setPolicy(true)}>
            전문보기
          </button>
        </div>
        <div className="reg-tabs">
          <button className={tab === "req" ? "on" : ""} type="button" onClick={() => setTab("req")}>
            필수정보
          </button>
          <button className={tab === "opt" ? "on" : ""} type="button" onClick={() => setTab("opt")}>
            선택정보
          </button>
        </div>

        {tab === "req" ? (
          <div className="reg-card">
            <h4>고객기본정보</h4>
            <div className="reg-row">
              <span>고객번호</span>
              <b className="reg-no">{no}</b>
            </div>
            <div className="reg-row">
              <span>고객명</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="성명을 입력하세요" />
            </div>
            <div className="reg-row">
              <span>휴대폰</span>
              <div>
                <div className="reg-phone">
                  <select value={p1} onChange={(e) => setP1(e.target.value)}>
                    {MOBILE.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <input value={p2} onChange={(e) => setP2(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                  <input value={p3} onChange={(e) => setP3(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                </div>
                <button className="reg-sub" type="button" onClick={() => nav.setToast("인증 문자를 발송했습니다")}>
                  휴대폰인증
                </button>
              </div>
            </div>
            <div className="reg-row">
              <span>애칭(선택)</span>
              <input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="애칭을 입력하세요" />
            </div>
            <div className="reg-row">
              <span>생년월일</span>
              <div>
                <Radio value={cal} onChange={setCal} options={["양력", "음력"]} />
                <div className="reg-ymd">
                  <select value={yy} onChange={(e) => setYy(e.target.value)}>
                    <option value="">년</option>
                    {YEARS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <select value={mm} onChange={(e) => setMm(e.target.value)}>
                    <option value="">월</option>
                    {MONTHS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <select value={dd} onChange={(e) => setDd(e.target.value)}>
                    <option value="">일</option>
                    {DAYS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="reg-row">
              <span>성별</span>
              <Radio value={gender} onChange={setGender} options={["남성", "여성"]} />
            </div>
            <div className="reg-row">
              <span>우편물 수령</span>
              <Radio value={mail} onChange={setMail} options={["자택", "직장", "없음"]} />
            </div>
            <AddrBlock
              label="자택주소"
              z1={homeZip1}
              z2={homeZip2}
              a1={home1}
              a2={home2}
              setZ1={setHomeZip1}
              setZ2={setHomeZip2}
              setA1={setHome1}
              setA2={setHome2}
              onSearch={() => nav.setToast("주소 검색은 실서비스에서 연결됩니다")}
            />
            <AddrBlock
              label="직장주소"
              z1={workZip1}
              z2={workZip2}
              a1={work1}
              a2={work2}
              setZ1={setWorkZip1}
              setZ2={setWorkZip2}
              setA1={setWork1}
              setA2={setWork2}
              onSearch={() => nav.setToast("주소 검색은 실서비스에서 연결됩니다")}
            />
          </div>
        ) : (
          <div className="reg-card">
            <h4>선택정보</h4>
            <div className="reg-row">
              <span>직업</span>
              <select value={job} onChange={(e) => setJob(e.target.value)}>
                {JOBS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="reg-row">
              <span>개척유형</span>
              <Radio value={recruit} onChange={setRecruit} options={["지인", "소개", "셀프", "에딧샵"]} />
            </div>
            <div className="reg-row">
              <span>결혼기념일</span>
              <div className="reg-ymd">
                <select value={wyy} onChange={(e) => setWyy(e.target.value)}>
                  <option value="">년</option>
                  {YEARS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <select value={wmm} onChange={(e) => setWmm(e.target.value)}>
                  <option value="">월</option>
                  {MONTHS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <select value={wdd} onChange={(e) => setWdd(e.target.value)}>
                  <option value="">일</option>
                  {DAYS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="reg-row">
              <span>전화번호</span>
              <div className="reg-phone">
                <select value={t1} onChange={(e) => setT1(e.target.value)}>
                  {TEL.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <input value={t2} onChange={(e) => setT2(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                <input value={t3} onChange={(e) => setT3(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
              </div>
            </div>
            <h4>수신동의(뷰티포인트 회원)</h4>
            <div className="reg-row">
              <span>이메일 동의</span>
              <div>
                <Radio value={emailOk} onChange={setEmailOk} options={["예", "아니오"]} />
                <div className="reg-email">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일을 입력해주세요" />
                  <span>@</span>
                  <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                    {["선택안함", "naver.com", "gmail.com", "daum.net"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="reg-row">
              <span>SMS 동의</span>
              <Radio value={smsOk} onChange={setSmsOk} options={["예", "아니오"]} />
            </div>
            <div className="reg-row">
              <span>TM 동의</span>
              <Radio value={tmOk} onChange={setTmOk} options={["예", "아니오"]} />
            </div>
            <div className="reg-row">
              <span>DM 동의</span>
              <Radio value={dmOk} onChange={setDmOk} options={["예", "아니오"]} />
            </div>
            <h4>수신동의(카운셀러 거래)</h4>
            <div className="reg-row">
              <span>수금/포인트 SMS</span>
              <Radio value={collSms} onChange={setCollSms} options={["예", "아니오"]} />
            </div>
          </div>
        )}
      </div>
      <div className="reg-foot">
        <button className="btn outline" type="button" onClick={() => setMemoOpen(true)}>
          고객메모
        </button>
        <button className="btn primary" type="button" onClick={save}>
          저장
        </button>
      </div>

      {policy ? (
        <div className="reg-mask" onClick={() => setPolicy(false)}>
          <div className="reg-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="reg-sheet-h">
              <b>개인정보 수집 및 이용동의</b>
              <button type="button" onClick={() => setPolicy(false)}>
                닫기
              </button>
            </div>
            <p className="reg-sheet-note">해당 내용은 고객이 직접 읽고 동의해 주셔야 합니다.</p>
            <p>
              ‘{counselor.name}’ 카운셀러의 약관을 읽고 동의합니다.
            </p>
            <p>
              <b>수집 항목</b> 성명, 생년월일, 성별, 휴대폰, 자택·직장 주소, 직업, 결혼기념일, 전화번호, 소개자, 거래내역
            </p>
            <p>
              <b>이용 목적</b> 방문판매 고객 관리, 거래 안내, 혜택 안내, CRM
            </p>
            <p>
              <b>보유 기간</b> 회원 탈퇴 시까지
            </p>
            <button
              className="btn outline"
              type="button"
              onClick={() => {
                setConsent(true);
                setPolicy(false);
              }}
            >
              동의
            </button>
          </div>
        </div>
      ) : null}

      {memoOpen ? (
        <div className="reg-mask" onClick={() => setMemoOpen(false)}>
          <div className="reg-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="reg-sheet-h">
              <b>고객메모</b>
              <button type="button" onClick={() => setMemoOpen(false)}>
                닫기
              </button>
            </div>
            <textarea className="tall" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="등록 시 상담이력에 남습니다" />
            <button className="btn primary" type="button" onClick={() => setMemoOpen(false)}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AddrBlock({
  label,
  z1,
  z2,
  a1,
  a2,
  setZ1,
  setZ2,
  setA1,
  setA2,
  onSearch,
}: {
  label: string;
  z1: string;
  z2: string;
  a1: string;
  a2: string;
  setZ1: (v: string) => void;
  setZ2: (v: string) => void;
  setA1: (v: string) => void;
  setA2: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="reg-row">
      <span>{label}</span>
      <div>
        <div className="reg-zip">
          <input value={z1} onChange={(e) => setZ1(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" />
          <i>-</i>
          <input value={z2} onChange={(e) => setZ2(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" />
          <button className="reg-sub" type="button" onClick={onSearch}>
            검색
          </button>
        </div>
        <input value={a1} onChange={(e) => setA1(e.target.value)} placeholder="기본주소" style={{ marginTop: 6 }} />
        <input value={a2} onChange={(e) => setA2(e.target.value)} placeholder="상세주소" style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}
