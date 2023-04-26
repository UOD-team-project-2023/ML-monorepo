import {
  Center,
  useMantineTheme,
  Box,
  Title,
  Button,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { At, Lock } from "tabler-icons-react";

function Login() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState();
  const theme = useMantineTheme();

  useEffect(() => {
    async function fetchUsers() {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiURL}/get_activation_status`);

      const data = await response.json();
      setStatus(data);

      console.log(data);
    }
    fetchUsers();
  });
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  if (!status) {
    return (window.location.href = "/register");
  }

  return (
    <Center maw={500} mx="auto" mt="15%">
      <Box w="75%">
        <Title style={{ padding: 5 }} size="h4">
          Login
        </Title>
        <form>
          <TextInput
            withAsterisk={true}
            style={{ padding: 5 }}
            placeholder="Username"
            icon={<At size={14} />}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <PasswordInput
            withAsterisk={true}
            style={{ padding: 5 }}
            placeholder="Password"
            icon={<Lock size={14} />}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <Button component={"a"} href={"/dashboard"}>
            Login
          </Button>
        </form>
        <Button
          component="a"
          target="_self"
          href="/dashboard"
          ml={5}
          mt={5}
          style={{
            backgroundColor: theme.colors.dark[6],
            fontWeight: "normal",
            color: theme.colors.indigo[5],
          }}
        >
          Login
        </Button>
      </Box>
    </Center>
  );
}

export default Login;
