import { Avatar, Group, UnstyledButton, Text } from "@mantine/core";
import { ChevronRight } from "tabler-icons-react";
import { useStyles } from "./userProfileButton.styles";

interface UserProfileButtonProps {
  name: string;
  image: string | null | undefined;
}

export function UserProfileButton({ name, image }: UserProfileButtonProps) {
  const { classes } = useStyles();

  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar color={"blue"} src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {name}
          </Text>
        </div>

        {<ChevronRight size="0.9rem" color={"red"} stroke={"1.5"} />}
      </Group>
    </UnstyledButton>
  );
}
