import CodeDialog from '../../../../shared/CodeDialog';
import React from 'react';
const SizeButtonGroupCode = () => {
  return (
    <>
      <CodeDialog>
        {`
import React from 'react';
import { Button, ButtonGroup, Stack } from '@mui/material';

<Stack spacing={1} justifyContent="center">
    <ButtonGroup size="small"  aria-label="outlined primary button group">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
    </ButtonGroup>
    <ButtonGroup  aria-label="outlined button group">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
    </ButtonGroup>
    <ButtonGroup size="large"  aria-label="text button group">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
    </ButtonGroup>
</Stack>`}
      </CodeDialog>
    </>
  );
};

export default SizeButtonGroupCode;
