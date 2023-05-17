import { useEffect, useState } from "react";
import { X, Check, Lock, User } from "tabler-icons-react";
import {
  Title,
  TextInput,
  PasswordInput,
  Progress,
  Text,
  Popover,
  Box,
  Center,
  Button,
  useMantineTheme,
  Flex,
  Image,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import monitorLizardLogo from "../../../public/monitor_lizard.png";
import { useLocation } from "react-router-dom";

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      color={meets ? "teal" : "red"}
      sx={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <Check size="0.9rem" /> : <X size="0.9rem" />} <Box ml={10}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /["'$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });
  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

async function handleFormSubmit(values: any) {
  const apiURL = import.meta.env.VITE_API_URL;

  const parsedValues = {
    username: values.username,
    password: values.password,
    access_level: "ADMIN",
  };

  const response = await fetch(`${apiURL}/create_user`, {
    method: "POST",
    body: JSON.stringify(parsedValues),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (response.status === 200) {
    sessionStorage.setItem("token", data.token);
    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
    window.location.href = "/dashboard";
  } else {
    notifications.show({
      title: "Error",
      message: data.detail,
      color: "red",
    });
  }
}

function Register() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get("error");

  const [popoverOpened, setPopoverOpened] = useState(false);
  const [passvalue, setPassValue] = useState("");

  const theme = useMantineTheme();

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(passvalue)}
    />
  ));

  const form = useForm({
    initialValues: {
      username: "",
      password: passvalue,
    },
    validate: {
      username: (value) => {
        if (!value) return "Username is required";
      },
      password: (value) => {
        if (!value) return "Password is required";
      },
    },
  });

  const strength = getStrength(passvalue);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  useEffect(() => {
    if (error === "unauthorized") {
      notifications.show({
        title: "Error",
        message: "You are not authorized to view the dashboard, please login or create an account.",
        color: "red",
      });
    }
  }, [error]);

  return (
    <Center maw={500} mx="auto" mt="15%">
      <Box w="75%">
        <Flex align={"center"}>
          <Image radius={15} src={monitorLizardLogo} width={64} height={64} />
          <Title size="20">Register your account</Title>
        </Flex>
        <form
          onSubmit={form.onSubmit((values) => {
            handleFormSubmit(values);
          })}
        >
          <TextInput
            style={{ padding: 5 }}
            withAsterisk={true}
            placeholder="Username"
            icon={<User size={14} />}
            {...form.getInputProps("username")}
          />

          <Popover opened={popoverOpened} position="bottom" width="target">
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  style={{ padding: 5 }}
                  withAsterisk
                  icon={<Lock size={14} />}
                  placeholder="Password"
                  {...form.getInputProps("password")}
                  value={passvalue}
                  onChange={(event) => {
                    setPassValue(event.currentTarget.value);
                    form.setFieldValue("password", event.currentTarget.value);
                  }}
                />
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Progress color={color} value={strength} size={5} mb="x5" />
              <PasswordRequirement
                label="includes at least 6 characters"
                meets={passvalue.length > 5}
              />
              {checks}
            </Popover.Dropdown>
          </Popover>
          <Flex direction={"column"}>
            <Button
              type="submit"
              ml={5}
              mt={5}
              fullWidth
              style={{
                backgroundColor: theme.colors.dark[6],
                fontWeight: "normal",
                color: theme.colors.indigo[5],
              }}
            >
              Create Account!
            </Button>
            <Anchor href="/login">Or click here to login</Anchor>
          </Flex>
        </form>
      </Box>
    </Center>
  );
}

export default Register;
