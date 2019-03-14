import React, { ChangeEvent, KeyboardEvent, FocusEvent } from 'react';
import { Input } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import styles from '@/pages/index.css'

export interface CellProps {
  exp: string // 表达式，放到输入框中
  value: string // 展示值，仅由props输入
  editable?: boolean // 是否可编辑，不可编辑时仅展示
  onExpressionChange: (exp: string) => void // 表达式输入变更
  onDescreption: () => void // 点击desc事件
}

/**
 * 可编辑的单元格
 * 
 * 表达式 exp 可编辑，变更后通知父级执行计算，返回value值展示在单元格中
 * 描述信息通过父级统一代理
 */
export class Cell extends React.PureComponent<CellProps> {
  readonly state = {
    editing: false,
    exp: '',
  }
  input: React.RefObject<Input>
  textarea: React.RefObject<TextArea>

  constructor(props:CellProps) {
    super(props)

    this.state.exp = props.exp

    this.input = React.createRef<Input>()
    this.textarea = React.createRef<TextArea>()

    this.toggleExpEdit = this.toggleExpEdit.bind(this)
    this.handleExpChange = this.handleExpChange.bind(this)
    this.handleExpSave = this.handleExpSave.bind(this)
  }

  // 表达式编辑状态toggle
  toggleExpEdit() {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.current.focus();
      }
    });
  };

  // 表达式变更
  handleExpChange(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ exp: e.target.value })
  }

  // 表达式编辑结束
  handleExpSave(e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) {
    this.toggleExpEdit();
    if (this.state.exp !== this.props.exp) {
      this.props.onExpressionChange(this.state.exp)
    }
  }

  render() {
    const { editable, value } = this.props
    const { editing } = this.state

    return (
      <div className={styles.cell}>
        {editable ? editing ? this.renderEdit() : this.renderNoEdit() : value}
      </div>
    );
  }

  renderEdit() {
    const { exp } = this.state
    return (
      <Input
        value={exp}
        ref={this.input}
        onChange={this.handleExpChange}
        onPressEnter={this.handleExpSave}
        onBlur={this.handleExpSave}
      />
    )
  }

  renderNoEdit() {
    const { value, onDescreption } = this.props
    return (
      <>
        <div onClick={this.toggleExpEdit} className={styles.word}>{value}</div>
        <i onClick={onDescreption} title="Remark">i</i>
      </>
    )
  }
}
