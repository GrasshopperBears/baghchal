'use client';

import React, { useState, useEffect } from 'react';

const SIZE = 5;
const TIGER_POSITIONS = [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
];

const ADJACENCY = {
    // 0행
    '0,0': [
        [0, 1],
        [1, 0],
        [1, 1],
    ],
    '0,1': [
        [0, 0],
        [0, 2],
        [1, 1],
    ],
    '0,2': [
        [0, 1],
        [0, 3],
        [1, 1],
        [1, 2],
        [1, 3],
    ],
    '0,3': [
        [0, 2],
        [0, 4],
        [1, 3],
    ],
    '0,4': [
        [0, 3],
        [1, 3],
        [1, 4],
    ],
    // 1행
    '1,0': [
        [0, 0],
        [1, 1],
        [2, 0],
    ],
    '1,1': [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
    ],
    '1,2': [
        [0, 2],
        [1, 1],
        [1, 3],
        [2, 2],
    ],
    '1,3': [
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [1, 4],
        [2, 2],
        [2, 3],
        [2, 4],
    ],
    '1,4': [
        [0, 4],
        [1, 3],
        [2, 4],
    ],
    // 2행
    '2,0': [
        [1, 0],
        [1, 1],
        [2, 1],
        [3, 1],
        [3, 0],
    ],
    '2,1': [
        [1, 1],
        [2, 0],
        [2, 2],
        [3, 1],
    ],
    '2,2': [
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2],
        [3, 3],
    ],
    '2,3': [
        [1, 3],
        [2, 2],
        [2, 4],
        [3, 3],
    ],
    '2,4': [
        [1, 3],
        [1, 4],
        [2, 3],
        [3, 3],
        [3, 4],
    ],
    // 3행
    '3,0': [
        [2, 0],
        [3, 1],
        [4, 0],
    ],
    '3,1': [
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 0],
        [3, 2],
        [4, 0],
        [4, 1],
        [4, 2],
    ],
    '3,2': [
        [2, 2],
        [3, 1],
        [3, 3],
        [4, 2],
    ],
    '3,3': [
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 2],
        [3, 4],
        [4, 2],
        [4, 3],
        [4, 4],
    ],
    '3,4': [
        [2, 4],
        [3, 3],
        [4, 4],
    ],
    // 4행
    '4,0': [
        [3, 0],
        [3, 1],
        [4, 1],
    ],
    '4,1': [
        [4, 0],
        [3, 1],
        [4, 2],
    ],
    '4,2': [
        [3, 1],
        [3, 2],
        [3, 3],
        [4, 1],
        [4, 3],
    ],
    '4,3': [
        [4, 2],
        [3, 3],
        [4, 4],
    ],
    '4,4': [
        [3, 3],
        [3, 4],
        [4, 3],
    ],
};

function initBoard() {
    const board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
    TIGER_POSITIONS.forEach(([x, y]) => {
        board[x][y] = 'T';
    });
    return board;
}

// function isAdjacent([x1, y1], [x2, y2]) {
//     // 대각선 포함 인접 체크
//     return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && !(x1 === x2 && y1 === y2);
// }

// 좌표가 보드 안에 있는지 확인
function inBounds(x, y) {
    return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

// 두 점이 연결선으로 연결되어 있는지 확인
function isConnected(from, to) {
    const key = from.join(',');
    const neighbors = ADJACENCY[key] || [];
    return neighbors.some(([nx, ny]) => nx === to[0] && ny === to[1]);
}

// SVG 선 그리기용: ADJACENCY 정보를 바탕으로 모든 선 추출
function getAllLines() {
    const lines = [];
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            const key = `${x},${y}`;
            const neighbors = ADJACENCY[key] || [];
            neighbors.forEach(([nx, ny]) => {
                // 중복 방지 (한 쌍만)
                if (nx > x || (nx === x && ny > y)) {
                    lines.push([
                        [x, y],
                        [nx, ny],
                    ]);
                }
            });
        }
    }
    return lines;
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

function Board({ goatsPlaced, setGoatsPlaced, capturedGoats, setCapturedGoats, turn, setTurn, winner, setWinner }) {
    const [board, setBoard] = useState(initBoard());
    const [selected, setSelected] = useState(null);

    // 승리 조건 체크
    function checkWinCondition(newBoard, newCapturedGoats) {
        // 호랑이가 움직일 수 있는지 확인
        let tigerCanMove = false;
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                if (newBoard[x][y] === 'T') {
                    const key = `${x},${y}`;
                    const neighbors = ADJACENCY[key] || [];
                    for (const [nx, ny] of neighbors) {
                        // 한 칸 이동
                        if (!newBoard[nx][ny]) {
                            tigerCanMove = true;
                            break;
                        }
                        // 점프(2칸) 이동: 중간에 염소, 목적지 빈칸
                        const jumpX = nx + (nx - x);
                        const jumpY = ny + (ny - y);
                        if (
                            inBounds(jumpX, jumpY) &&
                            isConnected([nx, ny], [jumpX, jumpY]) &&
                            newBoard[nx][ny] === 'G' &&
                            !newBoard[jumpX][jumpY]
                        ) {
                            tigerCanMove = true;
                            break;
                        }
                    }
                }
                if (tigerCanMove) break;
            }
            if (tigerCanMove) break;
        }
        if (!tigerCanMove) {
            setWinner('G');
            return;
        }
        if (newCapturedGoats >= 5) {
            setWinner('T');
            return;
        }
    }

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
            } else if (selected && !board[x][y] && isConnected(selected, [x, y])) {
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
            // 호랑이 선택
            if (board[x][y] === 'T' && !selected) {
                setSelected([x, y]);
            }
            // 호랑이 한 칸 이동
            else if (selected && !board[x][y] && isConnected(selected, [x, y])) {
                const newBoard = board.map((row) => [...row]);
                newBoard[x][y] = 'T';
                newBoard[selected[0]][selected[1]] = null;
                setBoard(newBoard);
                setTurn('G');
                setSelected(null);
                checkWinCondition(newBoard, capturedGoats);
            }
            // 호랑이 점프(2칸) 이동: 중간에 염소, 목적지는 빈칸, 선 연결 확인
            else if (selected && !board[x][y]) {
                const [sx, sy] = selected;
                const dx = x - sx;
                const dy = y - sy;
                // 2칸 이동만 허용
                if ((Math.abs(dx) === 2 && dy === 0) || (Math.abs(dy) === 2 && dx === 0) || (Math.abs(dx) === 2 && Math.abs(dy) === 2)) {
                    const midX = sx + dx / 2;
                    const midY = sy + dy / 2;
                    // 중간점, 목적지 모두 선 연결 확인
                    if (isConnected([sx, sy], [midX, midY]) && isConnected([midX, midY], [x, y]) && board[midX][midY] === 'G') {
                        const newBoard = board.map((row) => [...row]);
                        newBoard[x][y] = 'T';
                        newBoard[sx][sy] = null;
                        newBoard[midX][midY] = null;
                        const newCapturedGoats = capturedGoats + 1;
                        setBoard(newBoard);
                        setCapturedGoats(newCapturedGoats);
                        setTurn('G');
                        setSelected(null);
                        checkWinCondition(newBoard, newCapturedGoats);
                        return;
                    }
                }
                setSelected(null);
            } else {
                setSelected(null);
            }
        }
    }

    // SVG로 연결선 그리기
    function renderLines() {
        const scale = 80;
        const lines = getAllLines();
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
        <div style={{ position: 'relative', width: 400, height: 400, margin: 'auto' }}>
            <svg width={400} height={400} style={{ position: 'absolute', zIndex: 1 }}>
                {renderLines()}
            </svg>
            {renderPieces()}
        </div>
    );
}

export default Board;
