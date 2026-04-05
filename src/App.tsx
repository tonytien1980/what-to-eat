import './styles.css';

export default function App() {
  return (
    <main className="app-shell">
      <section className="quest-board" aria-label="今日遠征告示牌">
        <p className="eyebrow">命運之輪已待命</p>
        <h1>今天吃什麼：命運遠征</h1>
        <p className="tagline">
          召集旅伴、啟動命運、讓今天的午餐自己現身。
        </p>
        <button className="start-button" type="button">
          開啟今日遠征
        </button>
      </section>
    </main>
  );
}
