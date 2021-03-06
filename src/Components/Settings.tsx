import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import {
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Flex,
  Spacer,
} from '@chakra-ui/react';

export default function Settings() {
  const [nightscoutUrl, setNightscoutUrl] = useState('');
  const args = [{ nightscoutUrl }];

  const handleClick = () => {
    ipcRenderer.invoke('settings-save', ...args);
  };

  return (
    <Flex direction="column">
      <Box p="4">
        <FormControl id="nightscout-url" isRequired>
          <FormLabel>Nightscout URL</FormLabel>
          <Input
            value={nightscoutUrl}
            placeholder="https://yoursite.herokuapp.com"
            onChange={(e) => setNightscoutUrl(e.target.value)}
          />
          <FormHelperText>The URL to your Nightscout site</FormHelperText>
        </FormControl>
      </Box>
      <Spacer />
      <Box p="4">
        <Button colorScheme="blue" variant="solid" onClick={handleClick}>
          Save
        </Button>
      </Box>
    </Flex>
  );
}
