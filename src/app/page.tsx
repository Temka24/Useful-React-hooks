'use client';

import { memo, useState, useCallback, useId, useReducer, useMemo } from 'react';

// ---------- 1) React.memo + useCallback туршилт ----------
const ChildMemo = memo(function ChildMemo({ onSave }: { onSave: () => void }) {
    console.log('%cChildMemo render', 'color:lime');
    return (
        <button onClick={onSave} style={{ padding: 8, borderRadius: 8 }}>
            Save (memo child)
        </button>
    );
});

function ChildPlain({ onClick }: { onClick: () => void }) {
    console.log('%cChildPlain render', 'color:orange');
    return (
        <button onClick={onClick} style={{ padding: 8, borderRadius: 8 }}>
            Click (plain child)
        </button>
    );
}

// ---------- 2) useReducer ----------
type RState = { count: number; name: string };
type RAction =
    | { type: 'INCR' }
    | { type: 'DECR' }
    | { type: 'SET_NAME'; payload: string }
    | { type: 'RESET' };

function reducer(state: RState, action: RAction): RState {
    switch (action.type) {
        case 'INCR': {
            const next = { ...state, count: state.count + 1 };
            console.log('reducer -> INCR', next);
            return next;
        }
        case 'DECR': {
            const next = { ...state, count: state.count - 1 };
            console.log('reducer -> DECR', next);
            return next;
        }
        case 'SET_NAME': {
            const next = { ...state, name: action.payload };
            console.log('reducer -> SET_NAME', next);
            return next;
        }
        case 'RESET': {
            const next = { count: 0, name: '' };
            console.log('reducer -> RESET', next);
            return next;
        }
        default:
            return state;
    }
}

// ---------- 3) Main Page ----------
export default function Page() {
    console.log('%cPage render', 'color:deepskyblue');

    // A) useCallback + React.memo
    const [parentCount, setParentCount] = useState(0);

    // useCallback: function reference тогтвортой
    const handleSave = useCallback(() => {
        console.log('handleSave() called');
        alert('Saved!');
    }, []);

    // Харьцуулахын тулд memo-гүй child-д өгөх function (render бүрт ШИНЭ reference)
    const plainClick = () => console.log('plain child clicked');

    // B) useMemo — хүнд тооцоолол дахин бодохоос сэргийлнэ
    const [base, setBase] = useState(1);
    const doubled = useMemo(() => {
        console.log('%cuseMemo recompute (base changed)', 'color:violet');
        // хэт удаашруулахгүйн тулд жижиг “хиймэл” ажил:
        for (let i = 0; i < 5_00000; i++) {} // багахан цикл
        return base * 2;
    }, [base]);

    // C) useReducer
    const [rState, dispatch] = useReducer(reducer, { count: 0, name: '' });

    // D) useId — тогтвортой ID (SSR/CSR найдвартай)
    const idEmail = useId();
    const idEmail2 = useId();
    console.log('useId ids:', idEmail, idEmail2);

    return (
        <div
            style={{
                fontFamily: 'system-ui, sans-serif',
                padding: 24,
                display: 'grid',
                gap: 24,
            }}
        >
            {/* --- React.memo + useCallback --- */}
            <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <h2>1) React.memo + useCallback</h2>
                <p>Parent count: {parentCount}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => setParentCount((c) => c + 1)}>
                        Re-render parent (+1)
                    </button>
                    <ChildMemo onSave={handleSave} />
                    <ChildPlain onClick={plainClick} />
                </div>
                <ul style={{ marginTop: 8 }}>
                    <li>
                        <code>ChildMemo</code> нь <code>React.memo</code>-той —{' '}
                        <code>handleSave</code> нь <code>useCallback</code>-той тул parent дахин
                        render хийхэд ихэнхдээ <em>render болохгүй</em>.
                    </li>
                    <li>
                        <code>ChildPlain</code> нь memo-гүй — parent render бүрт <em>үргэлж</em>{' '}
                        render хийнэ.
                    </li>
                </ul>
            </section>

            {/* --- useMemo --- */}
            <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <h2>2) useMemo</h2>
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <button onClick={() => setBase((n) => n + 1)}>base +1</button>
                    <button onClick={() => setBase((n) => n - 1)}>base -1</button>
                    <span>
                        base = <b>{base}</b>, doubled (memo) = <b>{doubled}</b>
                    </span>
                </div>
                <p style={{ marginTop: 8 }}>
                    Консолд <code>useMemo recompute</code> зөвхөн <code>base</code> өөрчлөгдөх үед
                    гарч ирнэ.
                </p>
            </section>

            {/* --- useReducer --- */}
            <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <h2>3) useReducer</h2>
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <button onClick={() => dispatch({ type: 'INCR' })}>INCR</button>
                    <button onClick={() => dispatch({ type: 'DECR' })}>DECR</button>
                    <button onClick={() => dispatch({ type: 'RESET' })}>RESET</button>
                    <button onClick={() => dispatch({ type: 'SET_NAME', payload: 'Temuujin' })}>
                        SET_NAME
                    </button>
                    <span>
                        state = <code>{JSON.stringify(rState)}</code>
                    </span>
                </div>
                <p style={{ marginTop: 8 }}>
                    Консолд <code>reducer -&gt; ...</code> лог гарна. Иммутабл байдлаар{' '}
                    <em>шинэ объект</em> буцааж байгааг анзаар.
                </p>
            </section>

            {/* --- useId --- */}
            <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <h2>4) useId</h2>
                <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
                    <div>
                        <label htmlFor={idEmail}>Email (1)</label>
                        <input
                            id={idEmail}
                            type="email"
                            placeholder="first@example.com"
                            style={{ display: 'block', width: '100%' }}
                        />
                    </div>
                    <div>
                        <label htmlFor={idEmail2}>Email (2)</label>
                        <input
                            id={idEmail2}
                            type="email"
                            placeholder="second@example.com"
                            style={{ display: 'block', width: '100%' }}
                        />
                    </div>
                </div>
                <p style={{ marginTop: 8 }}>
                    Консолд <code>useId ids:</code> гэж 2 өөр тогтвортой ID хэвлэгдэнэ.
                </p>
            </section>
        </div>
    );
}
