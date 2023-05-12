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

function Login() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState();
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
  });

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
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <PasswordInput
            withAsterisk={true}
            style={{ padding: 5 }}
            placeholder="Password"
            icon={<Lock size={14} />}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </form>
        <Flex direction={"column"}>
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
          <Anchor href="/register">Or click here to create an account</Anchor>
        </Flex>
      </Box>
    </Center>
  );
}

export default Login;
