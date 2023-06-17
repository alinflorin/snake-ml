import Snake from "./Snake"
import styles from './App.module.scss'
import { useCallback, useState } from "react"

export const App = () => {
  const [started, setStarted] = useState(false);

  const toggleStart = useCallback(() => {
    setStarted(!started);
  }, [started, setStarted]);

  return (
    <div className={styles.App} onClick={toggleStart}>
      <div className={styles.GameContainer}>
        <Snake size={10} initialSnakeSize={5} difficulty={5} started={started} />
      </div>
    </div>
  )
}

export default App
