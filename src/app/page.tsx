'use client';

import React, { useState } from 'react';

const SIZE = 5;
const TIGER_POSITIONS = [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
];

function initBoard() {
    const board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
    TIGER_POSITIONS.forEach(([x, y]) => {
        board[x][y] = 'T';
    });
    return board;
}

function isAdjacent([x1, y1], [x2, y2]) {
    // 대각선 포함 인접 체크
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && !(x1 === x2 && y1 === y2);
}

const circleButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #888',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
};

function BaghChal() {
    const [board, setBoard] = useState(initBoard());
    const [goatsPlaced, setGoatsPlaced] = useState(0);
    const [capturedGoats, setCapturedGoats] = useState(0);
    const [turn, setTurn] = useState('G'); // G: 염소, T: 호랑이
    const [selected, setSelected] = useState(null);
    const [winner, setWinner] = useState(null);

    function inBounds(x, y) {
        return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
    }

    const checkWinCondition = (b, c) => {
        // 호랑이가 움직일 수 없는지 확인
        const tigers = [];
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                if (b[x][y] === 'T') tigers.push([x, y]);
            }
        }

        const canAnyTigerMove = tigers.some((tiger) => {
            const [x, y] = tiger;
            const directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],
            ];

            return directions.some(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                // 일반 이동 가능 여부
                if (inBounds(nx, ny) && !b[nx][ny]) {
                    console.log(nx, ny);

                    return true;
                }

                // 점프 이동 가능 여부
                const jx = x + 2 * dx;
                const jy = y + 2 * dy;
                if (inBounds(jx, jy) && !b[jx][jy]) {
                    const midX = x + dx;
                    const midY = y + dy;
                    console.log(jx, jy, midX, midY);
                    return b[midX][midY] === 'G';
                }
                return false;
            });
        });

        if (!canAnyTigerMove) setWinner('G');
        // console.log(capturedGoats);

        if (c >= 5) setWinner('T'); // 호랑이가 염소 5마리 잡으면 승리
    };

    // 염소 놓기
    function handlePlaceGoat(x, y) {
        if (board[x][y] || goatsPlaced >= 20) return;
        const newBoard = board.map((row) => [...row]);
        newBoard[x][y] = 'G';
        setBoard(newBoard);
        setGoatsPlaced(goatsPlaced + 1);
        setTurn('T');
        setSelected(null);
        checkWinCondition(newBoard, capturedGoats);
    }

    // 말 선택/이동/잡기
    function handleCellClick(x, y) {
        if (winner) return;

        if (turn === 'G') {
            if (goatsPlaced < 20) {
                handlePlaceGoat(x, y);
            } else if (board[x][y] === 'G' && !selected) {
                setSelected([x, y]);
            } else if (selected && !board[x][y] && isAdjacent(selected, [x, y])) {
                // 염소 이동
                const newBoard = board.map((row) => [...row]);
                newBoard[x][y] = 'G';
                newBoard[selected[0]][selected[1]] = null;
                setBoard(newBoard);
                setTurn('T');
                setSelected(null);
            } else {
                setSelected(null);
            }
        } else if (turn === 'T') {
            if (board[x][y] === 'T' && !selected) {
                setSelected([x, y]);
            } else if (selected) {
                const [sx, sy] = selected;
                const dx = x - sx;
                const dy = y - sy;

                // 이동 거리 검증
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    setSelected(null);
                    return;
                }

                // 일반 이동 (1칸)
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
                    if (!board[x][y]) {
                        // 반드시 빈 칸으로만 이동
                        const newBoard = board.map((row) => [...row]);
                        newBoard[x][y] = 'T';
                        newBoard[sx][sy] = null;
                        setBoard(newBoard);
                        setTurn('G');
                        setSelected(null);
                        checkWinCondition(newBoard, capturedGoats + 1);
                        // setTimeout(checkWinCondition, 0);
                    }
                }
                // 점프 이동 (2칸)
                else if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
                    const midX = sx + dx / 2;
                    const midY = sy + dy / 2;

                    if (board[midX][midY] === 'G' && !board[x][y]) {
                        const newBoard = board.map((row) => [...row]);
                        newBoard[x][y] = 'T';
                        newBoard[sx][sy] = null;
                        newBoard[midX][midY] = null;
                        setBoard(newBoard);
                        setCapturedGoats(capturedGoats + 1);
                        setTurn('G');
                        setSelected(null);
                        checkWinCondition(newBoard, capturedGoats + 1);
                        // setTimeout(checkWinCondition, 0);
                    }
                }
            }
        }
    }

    // SVG로 연결선 그리기
    function renderLines() {
        const points = [];
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                points.push([x, y]);
            }
        }
        const lines = [];
        // 가로, 세로, 대각선 연결
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                // 오른쪽
                if (y < SIZE - 1)
                    lines.push([
                        [x, y],
                        [x, y + 1],
                    ]);
                // 아래
                if (x < SIZE - 1)
                    lines.push([
                        [x, y],
                        [x + 1, y],
                    ]);
                // 오른쪽 아래 대각선
                if (x < SIZE - 1 && y < SIZE - 1)
                    lines.push([
                        [x, y],
                        [x + 1, y + 1],
                    ]);
                // 왼쪽 아래 대각선
                if (x < SIZE - 1 && y > 0)
                    lines.push([
                        [x, y],
                        [x + 1, y - 1],
                    ]);
            }
        }
        // SVG 좌표 변환
        const scale = 80;
        return lines.map(([[x1, y1], [x2, y2]], idx) => (
            <line
                key={idx}
                x1={y1 * scale + scale / 2}
                y1={x1 * scale + scale / 2}
                x2={y2 * scale + scale / 2}
                y2={x2 * scale + scale / 2}
                stroke='#888'
                strokeWidth='2'
            />
        ));
    }

    // 원형 말 렌더
    function renderPieces() {
        const scale = 80;
        return board.flatMap((row, x) =>
            row.map((cell, y) => {
                const isSelected = selected && selected[0] === x && selected[1] === y;
                return (
                    <button
                        key={`${x}-${y}`}
                        style={{
                            ...circleButtonStyle,
                            left: y * scale + scale / 2,
                            top: x * scale + scale / 2,
                            background: isSelected ? '#ffd700' : '#fff',
                            border: isSelected ? '3px solid #ffd700' : '2px solid #888',
                        }}
                        onClick={() => handleCellClick(x, y)}
                    >
                        {cell === 'T' ? '🐯' : cell === 'G' ? '🐐' : ''}
                    </button>
                );
            })
        );
    }

    return (
        <div>
            <h2>바그찰 (Bagh-Chal)</h2>
            <div style={{ position: 'relative', width: 400, height: 400, margin: 'auto' }}>
                <svg width={400} height={400} style={{ position: 'absolute', zIndex: 1 }}>
                    {renderLines()}
                </svg>
                {renderPieces()}
            </div>
            <div style={{ marginTop: 10 }}>
                {winner && <h3>{winner === 'G' ? '염소 승리!' : '호랑이 승리!'}</h3>}
                <b>턴:</b> {turn === 'G' ? '염소' : '호랑이'}
                <br />
                <b>놓인 염소:</b> {goatsPlaced} / 20
                <br />
                <b>잡힌 염소:</b> {capturedGoats}
            </div>
        </div>
    );
}

export default BaghChal;
