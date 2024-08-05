import { useState } from "react";
import styles from "./style.less";
import AMap from "./components/AMap";

import { Card, Empty, Input, Space, Switch, Typography } from "antd";
const { Search } = Input;
export default function HomePage() {
  const [checked, setChecked] = useState(false);
  const [mapKey, setMapKey] = useState("");

  return (
    <div className={styles.wrapper}>
      <Card>
        <Space align="center" size="large">
          <Space>
            <Typography.Text>Show District</Typography.Text>
            <Switch
              checkedChildren="Show"
              unCheckedChildren="Hidden"
              checked={checked}
              onChange={(v) => setChecked(v)}
            />
          </Space>
          <Space>
            <Typography.Text>AMap Key</Typography.Text>
            <Search
              placeholder="input map key"
              enterButton="Apply"
              onSearch={(v) => setMapKey(v)}
            />
          </Space>
        </Space>
      </Card>
      {!mapKey ? (
        <Empty description="Please input A valid AMap JSAPI key" />
      ) : (
        <AMap showDistrict={checked} key={mapKey} mapkey={mapKey} />
      )}
    </div>
  );
}
