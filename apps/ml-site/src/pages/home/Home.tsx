import { useEffect } from "react";

function Home() {
  useEffect(() => {
    async function fetchData() {
      const url = `${import.meta.env.VITE_API_URL}/check_fts`;

      const response = await fetch(url);

      if (response.status == 200) {
        window.location.href = "/login";
      } else {
        window.location.href = "/register";
      }
    }

    fetchData();
  }, []);

  return <div></div>;
}

export default Home;
