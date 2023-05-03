import { useEffect } from "react";

function Home() {
  useEffect(() => {
    async function fetchData() {
      const url = `${import.meta.env.VITE_API_URL}/checkfts`;

      const response = await fetch(url);
    }

    fetchData();
  }, []);

  return <div></div>;
}

export default Home;
