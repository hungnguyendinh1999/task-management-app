import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/Home";
import "./App.css";

function App() {

    return (
        // <>
        //     <section id="center">
        //         <div className="hero">
        //             <p>hero image goes here</p>
        //         </div>
        //         <div>
        //             <h1>Get started</h1>
        //             <p>
        //                 Edit <code>src/App.tsx</code> and save to test{" "}
        //                 <code>HMR</code>
        //             </p>
        //         </div>
        //         <button
        //             className="counter"
        //             onClick={() => setCount((count) => count + 1)}
        //         >
        //             Count is {count}
        //         </button>
        //     </section>

        //     <div className="ticks"></div>

        //     <section id="next-steps">
        //         <div id="docs">
        //             <svg
        //                 className="icon"
        //                 role="presentation"
        //                 aria-hidden="true"
        //             >
        //                 <use href="/icons.svg#documentation-icon"></use>
        //             </svg>
        //             <h2>Tasks</h2>
        //             <p>Your questions, answered</p>
        //             <ul>
        //                 <li>
        //                     <a href="https://vite.dev/" target="_blank">
        //                         <p>Vite logo goes here</p>
        //                         Explore Vite
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a href="https://react.dev/" target="_blank">
        //                         <p>React logo goes here</p>
        //                         Learn more
        //                     </a>
        //                 </li>
        //             </ul>
        //         </div>
        //         <div id="social">
        //             <svg
        //                 className="icon"
        //                 role="presentation"
        //                 aria-hidden="true"
        //             >
        //                 <use href="/icons.svg#social-icon"></use>
        //             </svg>
        //             <h2>Users</h2>
        //             <p>Join the Vite community</p>
        //             <ul>
        //                 <li>
        //                     <a
        //                         href="https://github.com/vitejs/vite"
        //                         target="_blank"
        //                     >
        //                         <svg
        //                             className="button-icon"
        //                             role="presentation"
        //                             aria-hidden="true"
        //                         >
        //                             <use href="/icons.svg#github-icon"></use>
        //                         </svg>
        //                         GitHub
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a href="https://chat.vite.dev/" target="_blank">
        //                         <svg
        //                             className="button-icon"
        //                             role="presentation"
        //                             aria-hidden="true"
        //                         >
        //                             <use href="/icons.svg#discord-icon"></use>
        //                         </svg>
        //                         Discord
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a href="https://x.com/vite_js" target="_blank">
        //                         <svg
        //                             className="button-icon"
        //                             role="presentation"
        //                             aria-hidden="true"
        //                         >
        //                             <use href="/icons.svg#x-icon"></use>
        //                         </svg>
        //                         X.com
        //                     </a>
        //                 </li>
        //                 <li>
        //                     <a
        //                         href="https://bsky.app/profile/vite.dev"
        //                         target="_blank"
        //                     >
        //                         <svg
        //                             className="button-icon"
        //                             role="presentation"
        //                             aria-hidden="true"
        //                         >
        //                             <use href="/icons.svg#bluesky-icon"></use>
        //                         </svg>
        //                         Bluesky
        //                     </a>
        //                 </li>
        //             </ul>
        //         </div>
        //     </section>

        //     <div className="ticks"></div>
        //     <section id="spacer"></section>
        // </>
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
