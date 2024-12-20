import { useRef } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager, useScrollHandlers } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { mainColor } from "@/utils/colors";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    gap: 24,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  actionImage: {
    width: 150,
    height: 150,
  },
  titleText: {
    fontSize: 20,
    color: "#E8FF58",
    fontWeight: "bold",
    textAlign: "center",
  },
  messageText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    lineHeight: 22,
  },
  contentText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: mainColor,
    height: 50,
    width: "100%",
    backgroundColor: "#333333",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  confirmButton: {
    width: 180,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});

function ConfirmActionSheets(props) {
  const insets = useSafeAreaInsets();
  const actionSheetRef = useRef(null);
  const scrollHandlers = useScrollHandlers({ refreshControlBoundary: 0 });

  const onCancel = async () => {
    await SheetManager.hide("confirm-action-sheets");
    if (props.payload?.onCancel) {
      props.payload?.onCancel();
    }
  };

  const onConfirm = async () => {
    await SheetManager.hide("confirm-action-sheets");
    if (props.payload?.onConfirm) {
      props.payload?.onConfirm();
    }
  };

  return (
    <ActionSheet
      headerAlwaysVisible
      id={props.sheetId}
      ref={actionSheetRef}
      containerStyle={{ backgroundColor: "#725ED4" }}
    >
      <ScrollView {...scrollHandlers} style={{ maxHeight: Dimensions.get("screen").height * 0.7 }}>
        <View style={[styles.container, { paddingBottom: insets.bottom, paddingHorizontal: Platform.isPad ? '20%' : 16 }]}>
          {!!props.payload?.header && <Text style={styles.titleText}>{props.payload?.header}</Text>}
          {!!props.payload?.title && <Text style={styles.messageText}>{props.payload?.title}</Text>}
          {!!props.payload?.message && (
            <Text style={styles.contentText}>{props.payload?.message}</Text>
          )}

          {props.payload?.cancelText && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{props.payload?.cancelText}</Text>
            </TouchableOpacity>
          )}
          {props.payload?.confirmText && (
            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>{props.payload?.confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ActionSheet>
  );
}

export default ConfirmActionSheets;
