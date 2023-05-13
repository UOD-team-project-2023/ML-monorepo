import {
  Center,
  useMantineTheme,
  Box,
  Title,
  Button,
  Image,
  PasswordInput,
  TextInput,
  Flex,
  Anchor,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { At, Lock } from "tabler-icons-react";
import monitorLizardLogo from "../../../public/monitor_lizard.png";
import { notifications } from "@mantine/notifications";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const theme = useMantineTheme();

  useEffect(() => {
    async function fetchUsers() {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiURL}/check_fts`);

      if (response.status !== 200) {
        window.location.href = "/register";
      }
    }
    fetchUsers();
  }, []);

  const handleUserLogin = async () => {
    const apiURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiURL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    const data = await response.json();
    if (response.status === 200) {
      sessionStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    }
    if (response.status !== 200) {
      notifications.show({
        title: "Login failed",
        message: data.detail,
        color: "red",
      });
    }
  };

  return (
    <Center maw={500} mx="auto" mt="15%">
      <Box w="75%">
        <Flex align={"center"}>
          <Image radius={15} src={monitorLizardLogo} width={64} height={64} />
          <Title style={{ padding: 5 }} size="h4">
            Login
          </Title>
        </Flex>
        <form>
          <TextInput
            withAsterisk={true}
            style={{ padding: 5 }}
            placeholder="Username"
            icon={<At size={14} />}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            withAsterisk={true}
            style={{ padding: 5 }}
            placeholder="Password"
            icon={<Lock size={14} />}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
        </form>
        <Flex direction={"column"}>
          <Button
            ml={5}
            mt={5}
            style={{
              backgroundColor: theme.colors.dark[6],
              fontWeight: "normal",
              color: theme.colors.indigo[5],
            }}
            onClick={() => {
              handleUserLogin();
            }}
          >
            Login
          </Button>
          <Anchor href="/register">Or click here to create an account</Anchor>
        </Flex>
      </Box>
    </Center>
  );
}

export default Login;
