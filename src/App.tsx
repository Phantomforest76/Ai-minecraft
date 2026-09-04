/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MinecraftGame } from './components/MinecraftGame';
import { MainMenu } from './components/MainMenu';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="w-full h-full overflow-hidden bg-[#73a3ff]">
      {!started && <MainMenu onStart={() => setStarted(true)} />}
      {started && <MinecraftGame />}
    </main>
  );
}

