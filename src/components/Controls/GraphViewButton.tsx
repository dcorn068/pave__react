import React from 'react';
import { Switch } from '@material-ui/core';
import styled from 'styled-components/macro';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { MenuItem, Select } from '@material-ui/core';
import {
  AUTOMATION_RISK,
  WORKERS,
  SALARY,
  STUDY,
  INDUSTRY,
  AUTOMATION_RISK_LABEL,
  WORKERS_LABEL,
  INDUSTRY_LABEL,
  SALARY_LABEL,
  STUDY_LABEL,
} from './SortPanel';

const MAP_VALUE_TO_DATALABEL = value => {
  switch (value) {
    case INDUSTRY:
      return INDUSTRY_LABEL;
    case WORKERS:
      return WORKERS_LABEL;
    case AUTOMATION_RISK:
      return AUTOMATION_RISK_LABEL;
    case SALARY:
      return SALARY_LABEL;
    case STUDY:
      return STUDY_LABEL;
    default:
      return null;
  }
};

export const VariablePickerMenu = ({ value, onChange, isIndustry = false }) => (
  <Select
    classes={{ root: 'select' }}
    value={value}
    onClick={event => event.preventDefault()}
    onMouseOver={event => {
      event.stopPropagation();
      event.preventDefault();
    }}
    onTouchStart={event => {
      event.stopPropagation();
      event.preventDefault();
    }}
    onChange={onChange}
  >
    <MenuItem value={isIndustry ? INDUSTRY : WORKERS}>
      <Tooltip
        placement="right"
        title={
          isIndustry
            ? 'Job industry, jobs that are related to each other'
            : 'Number of people working in this job'
        }
      >
        <div>{isIndustry ? 'Type' : 'Workers'}</div>
      </Tooltip>
    </MenuItem>
    <MenuItem value={AUTOMATION_RISK}>
      <Tooltip
        placement="right"
        title={'Risk that tasks will be replaced by machine work'}
      >
        <div>Risk</div>
      </Tooltip>
    </MenuItem>
    <MenuItem value={SALARY}>
      <Tooltip placement="right" title={'Average yearly income in $CAD'}>
        <div>Salary</div>
      </Tooltip>
    </MenuItem>
    <MenuItem value={STUDY}>
      <Tooltip
        placement="right"
        title={
          'Average years of study for people working in this job (not necessarily required for the job)'
        }
      >
        <div>Study</div>
      </Tooltip>
    </MenuItem>
  </Select>
);

const GraphViewButtonStyles = styled.div`
  display: flex;
  .MuiFormControlLabel-root,
  .MuiFormControlLabel-label,
  .labelAndSelect {
    padding-right: 4px;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-items: center;
  }
  .MuiFormControlLabel-root {
    display: flex;
    flex-direction: row-reverse;
    margin: 0;
  }
  .select {
    transform: scale(0.85);
  }
`;
export default ({ isGraphView, setIsGraphView, axisValues, setAxisValues }) => (
  <GraphViewButtonStyles>
    <FormControlLabel
      className="formControl graphView"
      control={
        <Switch
          onChange={() => {
            setIsGraphView(!isGraphView);
          }}
          checked={isGraphView}
        />
      }
      label={
        <div className="labelAndSelect">
          <div>
            Compar
            {isGraphView ? 'ing' : 'e'}
          </div>
          <VariablePickerMenu
            value={axisValues.x.displayName}
            onChange={event => {
              setAxisValues({
                ...axisValues,
                x: {
                  displayName: event.target.value,
                  dataLabel: MAP_VALUE_TO_DATALABEL(event.target.value),
                },
              });
            }}
          />
          <div>to</div>
          <VariablePickerMenu
            value={axisValues.y.displayName}
            onChange={event => {
              setAxisValues({
                ...axisValues,
                y: {
                  displayName: event.target.value,
                  dataLabel: MAP_VALUE_TO_DATALABEL(event.target.value),
                },
              });
            }}
          />
        </div>
      }
    />
  </GraphViewButtonStyles>
);