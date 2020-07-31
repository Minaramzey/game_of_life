import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import styled from "styled-components";
import Button from '@material-ui/core/Button';
import "./App.css";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import ClearIcon from '@material-ui/icons/Clear';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

function App() {
  const [gridRows, setGridRows] = useState({ rows: 25 });
  const [gridCols, setGridCols] = useState({ columns: 25 });
  const [locations, setLocations] = useState([
    [0, 1],
    [0, -1],
    [1, 0],
    [1, 1],
    [1, -1],
    [-1, 0],
    [-1, 1],
    [-1, -1],
  ]);
  
  const [intervalChange, setIntervalChange] = useState({ interval: 300});
  const [generation, setGeneration] = useState(0);
  const [canClick, setCanClick] = useState(true);
  const [running, setRunning] = useState(false);

  const handleChange = (e) => {
    setIntervalChange({ ...intervalChange, [e.target.name]: e.target.value });
  };

  const handleCols = (e) => {
    setGridCols({ ...gridCols, [e.target.name]: e.target.value });
  };

  const handleRows = (e) => {
    setGridRows({ ...gridRows, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < gridRows.rows; i++) {
      rows.push(Array.from(Array(gridCols.columns), () => 0));
    }
    return rows;
  };

  const generateRandomGrid = () => {
    const rows = [];
    for (let i = 0; i < gridRows.rows; i++) {
      rows.push(
        Array.from(Array(gridCols.columns), () => (Math.random() > 0.5 ? 1 : 0))
      );
    }
    return rows;
  };

  const runningRef = useRef(running);
  runningRef.current = running; 
  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setCanClick(!canClick);
    setGeneration((prevState) => (prevState += 1));
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < gridRows.rows; i++) {
          for (let j = 0; j < gridCols.columns; j++) {
            let neighbors = 0;
            locations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (
                newI >= 0 &&
                newI < gridRows.rows &&
                newJ >= 0 &&
                newJ < gridCols.columns
              ) {
                neighbors += g[newI][newJ]; 
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = 0;
            }
            else if (g[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, intervalChange.interval);
  }, [intervalChange, canClick, gridCols, gridRows, locations]);

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  return (
    <>
      <Header>Conway's Game of Life</Header>
      <MainDiv>
      <InfoDiv>
          <h1>Rules</h1>
          <p>
            Before partaking of the rules, you must know that the Game of Life
            is an infinite grid of square cells, which can either be in one of
            two states: <strong>live</strong> or <em>dead</em> (or less
            dramatically populated and unpopulated). Every cell interacts with
            eight nieghbours which are the cells that are horizontal, vertical
            or diagonal to that cell. Knowing this, we can proceed to look at
            each transition of the cell:
          </p>
          <ol>
            <li>
              Any live cell with fewer than two live neighbours dies, as if by
              underpopulation.
            </li>
            <li>
              Any live cell with two or three live neighbours lives on to the
              next generation.
            </li>
            <li>
              Any live cell with more than three live neighbours dies, as if by
              overpopulation.
            </li>
            <li>
              Any dead cell with exactly three live neighbours becomes a live
              cell, as if by reproduction.
            </li>
          </ol>
        </InfoDiv>
        <GameDiv>
          <h2>Generations # {generation}</h2>
         
            <Label htmlFor="interval">Edit the Speed of the Game: Pause The Game and Change Speed</Label>
            <div>
            <Button variant="contained" color="primary" onClick={() => {
              runSimulation(intervalChange.interval = (1000))
            }}
            >
              Slow
            </Button>

            <Button variant="contained" color="primary" onClick={() => {
              runSimulation(intervalChange.interval = (400)) 
            }}
            >
              Medium
            </Button>

            <Button variant="contained" color="primary" onClick={() => {
              runSimulation(intervalChange.interval = (30))  
            }}
            >
              Fast
            </Button>      
            </div>
      
         
          {/* <Typography id="discrete-slider" >
            Grid Speed
          </Typography>
          <Slider
            defaultValue={300}
            // value={intervalChange.interval}
            getAriaLabel={setTimeout}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={100}
            marks={true}
            min={0}
            max={1000}
            onChange={handleChange}
             /> */}

             {/* <Button variant='outlined' color='primary'>Submit</Button> */}
        
          <div>
            <Button variant="contained" color='primary' onClick={() => {
                setRunning(!running);
                if (!running) {
                  runningRef.current = true;
                  runSimulation();
                }
              }}
            >
              {running ? <PauseIcon/> : <PlayArrowIcon/>}
            </Button>
            <Button variant="contained" color="primary" onClick={() => {
              setGrid(generateRandomGrid());
              }}
            >
              <ShuffleIcon/>
            </Button>
            <Button variant="contained" color="secondary" onClick={() => {
              setGrid(generateEmptyGrid());
              setGeneration(0)
              setRunning()
              }}
            >
              <ClearIcon/>
            </Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols.columns}, 20px)`,

            }}
          >
            {grid.map((rows, i) =>
              rows.map((col, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => {
                    const newGrid = produce(grid, (gridCopy) => {
                      gridCopy[i][j] = grid[i][j] ? 0 : 1;
                    });
                    setGrid(newGrid);
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: grid[i][j] ? "red" : undefined,
                    border: "solid 1px black",
                  }}
                />
              ))
            )}
          </div>
        </GameDiv>
      </MainDiv>
    </>
  );
}

export default App;

const gridStyle = styled.div`
  display: "grid";
`;
const RowStyles = styled.div`
  width: 20px;
  height: 20px;
  border: "solid 1px black";
`;
const Header = styled.h1`
  text-align: center;
`;
const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

`;

const GameDiv = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;

  Button {
    width: 10rem;
    margin: .5%
    
  }
`;

const InfoDiv = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
`;

const Label =styled.label`

color:red;
text-decoration: underline;
font-size: 107%;`

