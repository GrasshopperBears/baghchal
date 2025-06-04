'use client';

import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';

function BaghChal() {
    const [goatsPlaced, setGoatsPlaced] = useState(0);
    const [capturedGoats, setCapturedGoats] = useState(0);
    const [turn, setTurn] = useState('G'); // G: 염소, T: 호랑이
    const [winner, setWinner] = useState(null);
    const scriptElement = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');

        script.setAttribute('src', '//t1.daumcdn.net/kas/static/ba.min.js');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('async', 'true');

        scriptElement.current?.appendChild(script);
    }, []);

    return (
        <div>
            <h1>Bagh-Chal</h1>
            <Board
                goatsPlaced={goatsPlaced}
                setGoatsPlaced={setGoatsPlaced}
                capturedGoats={capturedGoats}
                setCapturedGoats={setCapturedGoats}
                turn={turn}
                setTurn={setTurn}
                winner={winner}
                setWinner={setWinner}
            />
            <div style={{ marginTop: 10 }}>
                {winner && <h3>{winner === 'G' ? '염소 승리!' : '호랑이 승리!'}</h3>}
                <b>턴:</b> {turn === 'G' ? '염소' : '호랑이'}
                <br />
                <b>놓인 염소:</b> {goatsPlaced} / 20
                <br />
                <b>잡힌 염소:</b> {capturedGoats}
            </div>
            <div ref={scriptElement} style={{ width: '900px', height: '100px' }}>
                <ins
                    className='kakao_ad_area'
                    style={{ display: 'none' }}
                    data-ad-unit='DAN-8OF5DE5VnWGYbB0K'
                    data-ad-width='728'
                    data-ad-height='90'
                ></ins>
            </div>
        </div>
    );
}

export default BaghChal;
