import * as React from "react";
import {
  IPersonaSharedProps,
  Persona,
  PersonaSize,
  PersonaPresence,
} from "@fluentui/react/lib/Persona";
import { Slider } from "@fluentui/react/lib/Slider";
import { Stack } from "@fluentui/react/lib/Stack";
import { TestImages } from "@uifabric/example-data";

export const CustomPersona: React.FunctionComponent = () => {
  const examplePersona: IPersonaSharedProps = {
    imageUrl: TestImages.personaFemale,
    imageInitials: "AL",
    text: "Annie Lindqvist",
    secondaryText: "Software Engineer",
    tertiaryText: "In a meeting",
    optionalText: "Available at 4:00pm",
  };

  const [sliderValue, setSliderValue] = React.useState(0);
  const [personaSizeValue, setPersonaSizeValue] = React.useState(
    PersonaSize.size32
  );
  const sliderOnChange = (value: number) => {
    setSliderValue(value);
    switch (value) {
      case 0:
        setPersonaSizeValue(PersonaSize.size32);
        break;
      case 1:
        setPersonaSizeValue(PersonaSize.size48);
        break;
      case 2:
        setPersonaSizeValue(PersonaSize.size56);
        break;
      case 3:
        setPersonaSizeValue(PersonaSize.size72);
        break;
      case 4:
        setPersonaSizeValue(PersonaSize.size100);
        break;
      case 5:
        setPersonaSizeValue(PersonaSize.size120);
        break;
      default:
        break;
    }
  };

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Slider
        label="Control the size of Persona"
        max={5}
        onChange={sliderOnChange}
      />
      <Persona
        {...examplePersona}
        size={personaSizeValue}
        presence={PersonaPresence.online}
      />
    </Stack>
  );
};
